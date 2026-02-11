import os
from flask import Flask, request, jsonify
from flask_migrate import Migrate
from dotenv import load_dotenv
from models import db, User, Route, VehicleTypeEnum
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from flask_restx import Api, Namespace, Resource, fields
from flask_cors import CORS
from functools import wraps

# ── Load env ─────────────────────────────
load_dotenv()
migrate = Migrate()

def build_db_url(raw_url: str) -> str:
    """Fix @ in password for Supabase URLs"""
    if raw_url and "@@" in raw_url:
        return raw_url.replace("@@", "%40@")
    return raw_url

# ── JWT Token Verification Decorator ────
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token.split(' ')[1]
            
            data = jwt.decode(token, os.getenv("SECRET_KEY", "fallback-secret"), algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# ── Admin Required Decorator ────
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token.split(' ')[1]
            
            data = jwt.decode(token, os.getenv("SECRET_KEY", "fallback-secret"), algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            
            if not current_user or not current_user.is_admin:
                return jsonify({'message': 'Admin access required'}), 403
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# ── Create Flask App ─────────────────────
def create_app():
    app = Flask(__name__)

    # CORS Configuration - MUST BE BEFORE ROUTES
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type"],
            "supports_credentials": True
        }
    })

    # Database
    direct_url = build_db_url(os.getenv("DIRECT_URL"))
    app.config["SQLALCHEMY_DATABASE_URI"] = direct_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "fallback-secret")

    db.init_app(app)
    migrate.init_app(app, db)

    # ── RESTX / Swagger setup ──────────────
    api = Api(
        app,
        version="1.0",
        title="My Flask API",
        description="API documentation for testing endpoints",
        doc="/docs",
    )

    # ── MODELS ─────────────────────────────
    user_model = api.model("User", {
        "id": fields.String(example="uuid"),
        "username": fields.String(required=True, example="john_doe"),
        "email": fields.String(required=True, example="john@example.com"),
        "is_admin": fields.Boolean(example=False),
        "is_active": fields.Boolean(example=True),
    })

    create_user_model = api.model("CreateUser", {
        "username": fields.String(required=True, example="john_doe"),
        "email": fields.String(required=True, example="john@example.com"),
        "password": fields.String(required=True, example="password123"),
        "is_admin": fields.Boolean(example=False),
    })

    login_model = api.model("Login", {
        "username": fields.String(required=True, example="admin"),
        "password": fields.String(required=True, example="admin123"),
    })

    route_model = api.model("Route", {
        "id": fields.String(example="uuid"),
        "origin": fields.String(required=True, example="Laguna"),
        "destination": fields.String(required=True, example="Manila"),
        "fare": fields.Float(required=True, example=95.0),
        "distance_km": fields.Float(required=True, example=12.5),
        "vehicle_type": fields.String(required=True, example="jeep"),
        "description": fields.String(example="via main highway"),
        "is_active": fields.Boolean(example=True),
    })

    create_route_model = api.model("CreateRoute", {
        "origin": fields.String(required=True, example="Laguna"),
        "destination": fields.String(required=True, example="Manila"),
        "fare": fields.Float(required=True, example=95.0),
        "distance_km": fields.Float(required=True, example=12.5),
        "vehicle_type": fields.String(required=True, example="jeep"),
        "description": fields.String(example="via main highway"),
    })

    # ── AUTH Namespace ─────────────────────
    auth_ns = Namespace("auth", description="Authentication operations")

    @auth_ns.route("/login")
    class LoginResource(Resource):
        @auth_ns.expect(login_model)
        def post(self):
            """Login and get JWT token"""
            try:
                data = request.get_json()
                
                if not data or not data.get("username") or not data.get("password"):
                    return {"message": "Username and password are required"}, 400
                
                user = User.query.filter_by(username=data["username"]).first()
                
                if not user:
                    return {"message": "Invalid username or password"}, 401
                
                if not user.is_active:
                    return {"message": "Account is deactivated"}, 401
                
                if not check_password_hash(user.hashed_password, data["password"]):
                    return {"message": "Invalid username or password"}, 401
                
                # Generate JWT token
                token = jwt.encode({
                    "user_id": str(user.id),
                    "username": user.username,
                    "is_admin": user.is_admin,
                    "exp": datetime.now(timezone.utc) + timedelta(hours=24)
                }, app.config["SECRET_KEY"], algorithm="HS256")
                
                return {
                    "message": "Login successful",
                    "token": token,
                    "user": {
                        "id": str(user.id),
                        "username": user.username,
                        "email": user.email,
                        "is_admin": user.is_admin
                    }
                }, 200
                
            except Exception as e:
                print(f"Error in login: {str(e)}")
                return {"message": "Internal server error", "error": str(e)}, 500

    @auth_ns.route("/verify")
    class VerifyTokenResource(Resource):
        def get(self):
            """Verify if token is valid"""
            token = request.headers.get('Authorization')
            
            if not token:
                return {"message": "Token is missing", "valid": False}, 401
            
            try:
                if token.startswith('Bearer '):
                    token = token.split(' ')[1]
                
                data = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
                user = User.query.get(data['user_id'])
                
                if not user or not user.is_active:
                    return {"message": "Invalid token", "valid": False}, 401
                
                return {
                    "message": "Token is valid",
                    "valid": True,
                    "user": {
                        "id": str(user.id),
                        "username": user.username,
                        "email": user.email,
                        "is_admin": user.is_admin
                    }
                }, 200
                
            except jwt.ExpiredSignatureError:
                return {"message": "Token has expired", "valid": False}, 401
            except jwt.InvalidTokenError:
                return {"message": "Invalid token", "valid": False}, 401
            except Exception as e:
                print(f"Error in verify: {str(e)}")
                return {"message": "Internal server error", "valid": False}, 500

    @auth_ns.route("/me")
    class CurrentUserResource(Resource):
        def get(self):
            """Get current user info from token"""
            token = request.headers.get('Authorization')
            
            if not token:
                return {"message": "Token is missing"}, 401
            
            try:
                if token.startswith('Bearer '):
                    token = token.split(' ')[1]
                
                data = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
                user = User.query.get(data['user_id'])
                
                if not user:
                    return {"message": "User not found"}, 404
                
                return {
                    "id": str(user.id),
                    "username": user.username,
                    "email": user.email,
                    "is_admin": user.is_admin,
                    "is_active": user.is_active
                }, 200
                
            except jwt.ExpiredSignatureError:
                return {"message": "Token has expired"}, 401
            except jwt.InvalidTokenError:
                return {"message": "Invalid token"}, 401
            except Exception as e:
                print(f"Error in /me: {str(e)}")
                return {"message": "Internal server error"}, 500

    api.add_namespace(auth_ns, path="/api/auth")

    # ── USER CRUD Namespace ─────────────────
    user_ns = Namespace("users", description="User CRUD operations")

    @user_ns.route("")
    class UsersResource(Resource):
        def get(self):
            """List all users"""
            try:
                users = User.query.all()
                return [{
                    "id": str(user.id),
                    "username": user.username,
                    "email": user.email,
                    "is_admin": user.is_admin,
                    "is_active": user.is_active
                } for user in users], 200
            except Exception as e:
                print(f"Error in GET /api/users: {str(e)}")
                return {"message": "Internal server error", "error": str(e)}, 500

        @user_ns.expect(create_user_model)
        def post(self):
            """Create a new user"""
            try:
                data = request.get_json()
                
                # Validate required fields
                if not data.get("username") or not data.get("email") or not data.get("password"):
                    return {"message": "Username, email, and password are required"}, 400
                
                # Check if username exists
                if User.query.filter_by(username=data["username"]).first():
                    return {"message": "Username already exists"}, 400
                
                # Check if email exists
                if User.query.filter_by(email=data["email"]).first():
                    return {"message": "Email already exists"}, 400

                new_user = User(
                    username=data["username"],
                    email=data["email"],
                    hashed_password=generate_password_hash(data["password"]),
                    is_admin=data.get("is_admin", False),
                )
                db.session.add(new_user)
                db.session.commit()
                
                return {
                    "id": str(new_user.id),
                    "username": new_user.username,
                    "email": new_user.email,
                    "is_admin": new_user.is_admin,
                    "is_active": new_user.is_active
                }, 201
                
            except Exception as e:
                print(f"Error in POST /api/users: {str(e)}")
                db.session.rollback()
                return {"message": "Internal server error", "error": str(e)}, 500

    @user_ns.route("/<string:user_id>")
    class UserResource(Resource):
        def get(self, user_id):
            """Get a user by ID"""
            try:
                user = User.query.get(user_id)
                if not user:
                    return {"message": "User not found"}, 404
                
                return {
                    "id": str(user.id),
                    "username": user.username,
                    "email": user.email,
                    "is_admin": user.is_admin,
                    "is_active": user.is_active
                }, 200
            except Exception as e:
                print(f"Error in GET /api/users/{user_id}: {str(e)}")
                return {"message": "User not found"}, 404

        @user_ns.expect(create_user_model)
        def put(self, user_id):
            """Update a user"""
            try:
                user = User.query.get(user_id)
                if not user:
                    return {"message": "User not found"}, 404
                
                data = request.get_json()
                
                # Check username uniqueness (if changing)
                if data.get("username") and data["username"] != user.username:
                    if User.query.filter_by(username=data["username"]).first():
                        return {"message": "Username already exists"}, 400
                
                # Check email uniqueness (if changing)
                if data.get("email") and data["email"] != user.email:
                    if User.query.filter_by(email=data["email"]).first():
                        return {"message": "Email already exists"}, 400
                
                user.username = data.get("username", user.username)
                user.email = data.get("email", user.email)
                if data.get("password"):
                    user.hashed_password = generate_password_hash(data["password"])
                user.is_admin = data.get("is_admin", user.is_admin)
                
                db.session.commit()
                
                return {
                    "id": str(user.id),
                    "username": user.username,
                    "email": user.email,
                    "is_admin": user.is_admin,
                    "is_active": user.is_active
                }, 200
                
            except Exception as e:
                print(f"Error in PUT /api/users/{user_id}: {str(e)}")
                db.session.rollback()
                return {"message": "Internal server error", "error": str(e)}, 500

        def delete(self, user_id):
            """Delete a user"""
            try:
                user = User.query.get(user_id)
                if not user:
                    return {"message": "User not found"}, 404
                
                db.session.delete(user)
                db.session.commit()
                return {"message": "User deleted successfully"}, 200
            except Exception as e:
                print(f"Error in DELETE /api/users/{user_id}: {str(e)}")
                db.session.rollback()
                return {"message": "Internal server error", "error": str(e)}, 500

    api.add_namespace(user_ns, path="/api/users")

    # ── ROUTE CRUD Namespace ───────────────
    route_ns = Namespace("routes", description="Route CRUD operations")

    @route_ns.route("")
    class RoutesResource(Resource):
        def get(self):
            """List all routes with optional vehicle_type filter"""
            try:
                vehicle_type_param = request.args.get('vehicle_type')
                query = Route.query.filter_by(is_active=True)
                
                if vehicle_type_param:
                    try:
                        vehicle_enum = VehicleTypeEnum(vehicle_type_param)
                        query = query.filter_by(vehicle_type=vehicle_enum)
                    except ValueError:
                        return {"message": f"Invalid vehicle_type: {vehicle_type_param}"}, 400
                
                routes = query.all()
                return [route.to_dict() for route in routes], 200
                
            except Exception as e:
                print(f"Error in GET /api/routes: {str(e)}")
                return {"message": "Internal server error", "error": str(e)}, 500

        @route_ns.expect(create_route_model)
        def post(self):
            """Create a new route"""
            try:
                data = request.get_json()
                
                if data["vehicle_type"] not in {v.value for v in VehicleTypeEnum}:
                    return {"message": "Invalid vehicle_type"}, 400
                
                new_route = Route(
                    origin=data["origin"],
                    destination=data["destination"],
                    fare=data["fare"],
                    distance_km=data["distance_km"],
                    vehicle_type=VehicleTypeEnum(data["vehicle_type"]),
                    description=data.get("description"),
                )
                db.session.add(new_route)
                db.session.commit()
                
                return new_route.to_dict(), 201
                
            except Exception as e:
                print(f"Error in POST /api/routes: {str(e)}")
                db.session.rollback()
                return {"message": "Internal server error", "error": str(e)}, 500

    @route_ns.route("/<string:route_id>")
    class RouteResource(Resource):
        def get(self, route_id):
            """Get a route by ID"""
            try:
                route = Route.query.get(route_id)
                if not route:
                    return {"message": "Route not found"}, 404
                return route.to_dict(), 200
            except Exception as e:
                print(f"Error in GET /api/routes/{route_id}: {str(e)}")
                return {"message": "Route not found"}, 404

        @route_ns.expect(create_route_model)
        def put(self, route_id):
            """Update a route"""
            try:
                route = Route.query.get(route_id)
                if not route:
                    return {"message": "Route not found"}, 404
                
                data = request.get_json()
                
                route.origin = data.get("origin", route.origin)
                route.destination = data.get("destination", route.destination)
                route.fare = data.get("fare", route.fare)
                route.distance_km = data.get("distance_km", route.distance_km)
                
                if data.get("vehicle_type"):
                    if data["vehicle_type"] not in {v.value for v in VehicleTypeEnum}:
                        return {"message": "Invalid vehicle_type"}, 400
                    route.vehicle_type = VehicleTypeEnum(data["vehicle_type"])
                    
                route.description = data.get("description", route.description)
                db.session.commit()
                
                return route.to_dict(), 200
                
            except Exception as e:
                print(f"Error in PUT /api/routes/{route_id}: {str(e)}")
                db.session.rollback()
                return {"message": "Internal server error", "error": str(e)}, 500

        def delete(self, route_id):
            """Delete a route"""
            try:
                route = Route.query.get(route_id)
                if not route:
                    return {"message": "Route not found"}, 404
                
                db.session.delete(route)
                db.session.commit()
                return {"message": "Route deleted successfully"}, 200
            except Exception as e:
                print(f"Error in DELETE /api/routes/{route_id}: {str(e)}")
                db.session.rollback()
                return {"message": "Internal server error", "error": str(e)}, 500

    api.add_namespace(route_ns, path="/api/routes")

    return app

# ── Run App ─────────────────────────────
app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)