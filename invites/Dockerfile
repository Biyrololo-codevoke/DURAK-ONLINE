FROM python:3.13

WORKDIR /invites

COPY requirements.txt /invites

RUN pip install -r requirements.txt

COPY . /invites

EXPOSE 9100

CMD ["python", "main.py"]
