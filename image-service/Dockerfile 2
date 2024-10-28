FROM python:3.10

WORKDIR /image-service

COPY requirements.txt /image-service

RUN pip install -r requirements.txt

COPY . /image-service

EXPOSE 5200

CMD ["flask", "run", "--host", "localhost", "--port", "5200"]