from sqlmodel import Session, select
from ..db import init_db, User, engine
from ..core.security import hash_password


def run():
    init_db()
    with Session(engine) as session:
        email = "admin@gmail.com"
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            session.add(User(email=email, password_hash=hash_password(
                "123465789"), name="Project Manager", role="PM"))
            session.commit()
            print("Seeded admin: admin@gmail.com / 123465789")
        else:
            print("Admin already exists")


if __name__ == "__main__":
    run()
