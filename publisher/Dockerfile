FROM python:3.10

WORKDIR /app

COPY . .

RUN pip install paho-mqtt

CMD [ "python", "publisher.py" ]