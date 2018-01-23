module.exports = {
  "queueName": "beebon_mail",
  "redis": {
    port: 6379,
    host: 'localhost',
  },
  "filestore": "/var/beebon/filestore/",
  "smtpAccounts":{
    "w@mail.ru": {
      "connectionSettings": {
        "host":"smtp.yandex.ru",
        "port": 587,
        "secure": false,
        "requireTLS": true,
        "auth": {
          "user": "w@mail.ru",
          "pass": "7"
        }
      },
      "mailDefaults": {
        "from":"w@mail.ru",
        "replyTo":"w@mail.ru"
      }
    }   
  }
}