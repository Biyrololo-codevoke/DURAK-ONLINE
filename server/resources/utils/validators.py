import re


def validate_username(username: str) -> tuple[bool, str | None]:
    forbidden_chars = ["@", "!", "#", "$", "%", "^", "&", "*", "(", ")"]
    if any(char for char in username if char in forbidden_chars):
        return False, "Username cannot contain any of special characters: @!#$%^&*()"

    return True, None


def validate_email(email) -> tuple[bool, str | None]:
    email_pattern = "^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$"

    if not re.match(email_pattern, email):
        return False, "Invalid email"

    return True, None
