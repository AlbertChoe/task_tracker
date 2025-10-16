from sqlmodel import Session, select
from ..db import init_db, User, engine
from ..core.security import hash_password


def seed_admins():
    init_db()
    admins = [
        {
            "email": "admin@gmail.com",
            "password": "123456789",
            "name": "Project Manager",
            "role": "PM",
        },
        {
            "email": "admin2@gmail.com",
            "password": "123456789",
            "name": "Project Manager",
            "role": "PM",
        },
    ]

    with Session(engine) as session:
        for admin in admins:
            existing_user = session.exec(
                select(User).where(User.email == admin["email"])
            ).first()
            if not existing_user:
                user = User(
                    email=admin["email"],
                    password_hash=hash_password(admin["password"]),
                    name=admin["name"],
                    role=admin["role"],
                )
                session.add(user)
                print(f"Seeded admin: {admin['email']} / {admin['password']}")
            else:
                print(f"Admin already exists: {admin['email']}")

        session.commit()


if __name__ == "__main__":
    seed_admins()
