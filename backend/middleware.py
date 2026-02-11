import os
import jwt
from functools import wraps
from flask import request, jsonify, g
from models import User


def token_required(f):
    """
    Decorator that validates the JWT in the Authorization header.

    Usage:
        @some_blueprint.get("/protected")
        @token_required
        def protected_route():
            user = g.current_user   # the authenticated User model instance
            ...
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({"message": "Authorization header missing or malformed."}), 401

        token = auth_header.split(" ", 1)[1].strip()

        try:
            payload = jwt.decode(
                token,
                os.getenv("SECRET_KEY", "fallback-secret"),
                algorithms=["HS256"],
            )
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token."}), 401

        user = User.query.get(payload.get("sub"))
        if user is None or not user.is_active:
            return jsonify({"message": "User not found or deactivated."}), 401

        g.current_user = user
        return f(*args, **kwargs)

    return decorated


def admin_required(f):
    """
    Decorator that validates the JWT AND checks is_admin == True.
    Must be applied AFTER @token_required.

    Usage:
        @some_blueprint.delete("/admin-only")
        @token_required
        @admin_required
        def admin_route():
            ...
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        if not getattr(g, "current_user", None) or not g.current_user.is_admin:
            return jsonify({"message": "Admin access required."}), 403
        return f(*args, **kwargs)

    return decorated