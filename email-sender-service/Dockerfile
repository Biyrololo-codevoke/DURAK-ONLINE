FROM python:3.11

WORKDIR /email_sender

COPY requirements.txt /email_sender

RUN pip install -r requirements.txt

COPY . /email_sender

CMD ["python", "main.py"]
