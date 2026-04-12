---
title: 如何给 WSL 使用宿主机 VPN 并配置 Docker
date: 2026-03-06 21:41:28
tags: [WSL, Docker]
categories: 疑难解答
---

国内正常工作的Docker镜像站越来越少了, 导致配Docker环境也越来越痛苦了. 于是自然想到可以利用VPN给Docker做一个代理, 具体方法如下.

打开代理软件的这个设置:

![](/img/wsl-vpn-docker/1.png)

找到代理软件的端口, 我用的FlClash 端口号是7890, 需要在防火墙新建一条规则放行入站.

<!--more-->

(其实这一步理论上不做也行, 可以先跳过, 出问题了再回头试试.)

可以直接在管理员PowerShell里运行:

```powershell
New-NetFirewallRule -DisplayName "Allow WSL Proxy 7890" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 7890
```

或者 Win+R 打开 `wf.msc`, 入站规则 - 新建规则 - 端口 - TCP - 本地端口输入7890 - 允许连接, 然后一路下一步.

然后Win11有一个非常好的功能, 可以让WSL直接和Windows共享网络配置.

在用户文件夹(例如 `C:\Users\用户名`, 如果找不到可以 Win+R 输入 `%USERPROFILE%`) 新建一个名叫 `.wslconfig` 的文件, 内容为:

```
[wsl2]
networkingMode=mirrored
```

然后 `wsl --shutdown` 重启 WSL.

在WSL的终端运行:

```bash
export http_proxy="http://127.0.0.1:7890"
export https_proxy=$http_proxy
export HTTP_PROXY=$http_proxy
export HTTPS_PROXY=$http_proxy
```

即可.

想测试可以运行 `curl https://www.google.com`, 有正常响应就是成功了, 如果很长时间没反应大概率是寄了.

需要关掉代理的时候, 运行:

```bash
unset HTTP_PROXY HTTPS_PROXY NO_PROXY http_proxy https_proxy no_proxy
```

注意, 如果需要 `sudo` 执行某个需要代理的程序, 要带上 `-E` 参数, 否则 `sudo` 默认不会传递环境变量, 例如:

```bash
sudo -E ./installer
```

Docker配置需要在终端执行:

```bash
sudo mkdir -p /etc/systemd/system/docker.service.d
sudo nano /etc/systemd/system/docker.service.d/http-proxy.conf
```

写入:

```
[Service]
Environment="HTTP_PROXY=http://127.0.0.1:7890"
Environment="HTTPS_PROXY=http://127.0.0.1:7890"
Environment="NO_PROXY=localhost,127.0.0.1,docker-registry.somecorporation.com"
```

然后重启Docker:

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

即可.