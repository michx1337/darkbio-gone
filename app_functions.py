import bcrypt
import random
import string


def CheckPassword(PASSWORD, HASHED):
    return bcrypt.checkpw(bytes(PASSWORD, 'utf-8'), bytes(HASHED, 'utf-8'))


def HashPassword(PASSWORD):
    return bcrypt.hashpw(bytes(PASSWORD, 'utf-8'), bcrypt.gensalt())


def random_strings(length=10):
    return ''.join([
        random.choice(string.ascii_letters + string.digits)
        for i in range(length)
    ])
