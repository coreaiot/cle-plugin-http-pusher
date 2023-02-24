# CLE 插件 HTTP Pusher
支持：
- http
- https
- http2

```bash
cle plugins i /path/to/cle-plugin-mqtt-pusher-x.x.x.cp
```

服务端需要实现接口：
- 认证接口（可选）
- 上报接口

## 认证接口
此接口接受用户名和密码并返回一个 Token 。接受格式如下：
> headers
```
Content-Type: application/json
```
> body
```json
{
  "username": "text",
  "password": "123456"
}
```
返回格式如下：
> body
```json
{
  "token": "xxx"
}
```

## 上报接口
此接口接受 JSON 格式报文。如果使用认证，会在 headers 添加一条信息如下：
> headers
```
Authorization: Bearer xxxxxx
Content-Type: application/json
```
返回 2xx 状态码即可。

### GZip 压缩
如果使用压缩，会在 headers 添加一条信息如下：
```
Authorization: Bearer xxxxxx
Content-Type: application/json
Content-Encoding: gzip
```
返回 2xx 状态码即可。