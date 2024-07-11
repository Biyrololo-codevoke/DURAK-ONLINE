FROM python:3.10

WORKDIR /websocket-server

COPY requirements.txt /websocket-server

RUN pip install -r requirements.txt

COPY . /websocket-server

EXPOSE 9000

CMD ["python", "main.py"]
