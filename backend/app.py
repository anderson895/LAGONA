import os
from flask import Flask, request
from flask_migrate import Migrate
from dotenv import load_dotenv
from models import db, User, Route, VehicleTypeEnum
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from flask_restx import Api, Namespace, Resource, fields

# ── Load env ─────────────────────────────
load_dotenv()
migrate = Migrate()

def build_db_url(raw_url: str) -> str:
    """Fix @ in password for Supabase URLs"""
    if raw_url and "@@" in raw_url:
        return raw_url.replace("@@", "%40@")
    return raw_url

# ── Create Flask App ─────────────────────
def create_app():
    app = Flask(__name__)

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

    # ── USER CRUD Namespace ─────────────────
    user_ns = Namespace("users", description="User CRUD operations")

    @user_ns.route("")
    class UsersResource(Resource):
        @user_ns.marshal_list_with(user_model)
        def get(self):
            """List all users"""
            return User.query.all()

        @user_ns.expect(create_user_model)
        @user_ns.marshal_with(user_model, code=201)
        def post(self):
            """Create a new user"""
            data = request.get_json()
            if User.query.filter_by(username=data["username"]).first():
                user_ns.abort(400, "Username already exists")
            if User.query.filter_by(email=data["email"]).first():
                user_ns.abort(400, "Email already exists")

            new_user = User(
                username=data["username"],
                email=data["email"],
                hashed_password=generate_password_hash(data["password"]),
                is_admin=data.get("is_admin", False),
            )
            db.session.add(new_user)
            db.session.commit()
            return new_user, 201

    @user_ns.route("/<string:user_id>")
    class UserResource(Resource):
        @user_ns.marshal_with(user_model)
        def get(self, user_id):
            """Get a user by ID"""
            user = User.query.get_or_404(user_id)
            return user

        @user_ns.expect(create_user_model)
        @user_ns.marshal_with(user_model)
        def put(self, user_id):
            """Update a user"""
            user = User.query.get_or_404(user_id)
            data = request.get_json()
            user.username = data.get("username", user.username)
            user.email = data.get("email", user.email)
            if data.get("password"):
                user.hashed_password = generate_password_hash(data["password"])
            user.is_admin = data.get("is_admin", user.is_admin)
            db.session.commit()
            return user

        def delete(self, user_id):
            """Delete a user"""
            user = User.query.get_or_404(user_id)
            db.session.delete(user)
            db.session.commit()
            return {"message": "User deleted"}, 200

    api.add_namespace(user_ns, path="/api/users")

    # ── ROUTE CRUD Namespace ───────────────
    route_ns = Namespace("routes", description="Route CRUD operations")

    @route_ns.route("")
    class RoutesResource(Resource):
        @route_ns.marshal_list_with(route_model)
        def get(self):
            """List all routes"""
            return Route.query.all()

        @route_ns.expect(create_route_model)
        @route_ns.marshal_with(route_model, code=201)
        def post(self):
            """Create a new route"""
            data = request.get_json()
            if data["vehicle_type"] not in {v.value for v in VehicleTypeEnum}:
                route_ns.abort(400, "Invalid vehicle_type")
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
            return new_route, 201

    @route_ns.route("/<string:route_id>")
    class RouteResource(Resource):
        @route_ns.marshal_with(route_model)
        def get(self, route_id):
            """Get a route by ID"""
            route = Route.query.get_or_404(route_id)
            return route

        @route_ns.expect(create_route_model)
        @route_ns.marshal_with(route_model)
        def put(self, route_id):
            """Update a route"""
            route = Route.query.get_or_404(route_id)
            data = request.get_json()
            route.origin = data.get("origin", route.origin)
            route.destination = data.get("destination", route.destination)
            route.fare = data.get("fare", route.fare)
            route.distance_km = data.get("distance_km", route.distance_km)
            if data.get("vehicle_type"):
                if data["vehicle_type"] not in {v.value for v in VehicleTypeEnum}:
                    route_ns.abort(400, "Invalid vehicle_type")
                route.vehicle_type = VehicleTypeEnum(data["vehicle_type"])
            route.description = data.get("description", route.description)
            db.session.commit()
            return route

        def delete(self, route_id):
            """Delete a route"""
            route = Route.query.get_or_404(route_id)
            db.session.delete(route)
            db.session.commit()
            return {"message": "Route deleted"}, 200

    api.add_namespace(route_ns, path="/api/routes")

    return app

# ── Run App ─────────────────────────────
app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
