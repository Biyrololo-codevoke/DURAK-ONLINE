from .db import db, BaseModel, retry_on_exception


class VerifyExceptions(Exception):
    class NotFound(Exception):
        pass

    class IncorrectCode(Exception):
        pass


class VerifyCodeModel(BaseModel):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    code = db.Column(db.String(6))

    @classmethod
    @retry_on_exception(max_retries=3, delay=0.05)
    def verify(cls, user_id: int, code: str) -> bool:
        global logger
        user_verify = cls.query.filter_by(user_id=user_id).first()

        if not user_verify:
            raise VerifyExceptions.NotFound
        
        if user_verify.code == code:
            user_verify.delete()
            return True
        else:
            raise VerifyExceptions.IncorrectCode
