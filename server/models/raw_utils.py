from .db import db_logger, db
from sqlalchemy import text


def get_users(username: str, offset: int, limit: int) -> list[tuple[int, str]]:
    try:
        # Ваш сырой SQL-запрос
        sql_query = text(f"""
        SELECT id, "_username", image_id
        FROM public."user"
        where "_username" ilike :username
        offset {offset} limit {limit};
        """
        )
        results = db.session.execute(sql_query, {"username": f"%{username.replace('%','')}%"}).fetchall()

        return [{
            "id": data[0],
            "username": data[1],
            "image_id": data[2]
        } for data in results]

    except Exception as e:
        db_logger.error(f"Ошибка: {e}")
        return None 