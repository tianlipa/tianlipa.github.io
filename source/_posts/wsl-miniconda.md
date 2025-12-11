---
title: 安装 WSL 并安装 Miniconda
date: 2025-12-02 23:12:16
tags: 疑难解答
---

给Pettingzoo配环境把自己配红温了, 查issues发现Windows的问题导致某个库不支持, 遂改用WSL.

<!--more-->

## 安装WSL

官方的安装方法是打开管理员PowerShell, 运行`wsl --install`, 然后你就会发现250MB的东西需要下载两个小时. 当然你要是网速够快就当我没说.

所以正确方法是打开 [GitHub Releases](https://github.com/microsoft/WSL/releases), 找到最新版本下载msi安装包, 运行, 之后再打开PowerShell, 运行:

```powershell
wsl --install
```

默认安装Ubuntu, 如果想装别的系统要指定参数.

然后就完事了, 顺利得难以置信.

## 换源

```bash
cd /etc/apt
cp sources.list sources.list.bak
sudo vim sources.list
```

中科大源:

```
# 默认注释了源码仓库，如有需要可自行取消注释
deb https://mirrors.ustc.edu.cn/ubuntu/ noble main restricted universe multiverse
# deb-src https://mirrors.ustc.edu.cn/ubuntu/ noble main restricted universe multiverse

deb https://mirrors.ustc.edu.cn/ubuntu/ noble-security main restricted universe multiverse
# deb-src https://mirrors.ustc.edu.cn/ubuntu/ noble-security main restricted universe multiverse

deb https://mirrors.ustc.edu.cn/ubuntu/ noble-updates main restricted universe multiverse
# deb-src https://mirrors.ustc.edu.cn/ubuntu/ noble-updates main restricted universe multiverse

deb https://mirrors.ustc.edu.cn/ubuntu/ noble-backports main restricted universe multiverse
# deb-src https://mirrors.ustc.edu.cn/ubuntu/ noble-backports main restricted universe multiverse

# 预发布软件源，不建议启用
# deb https://mirrors.ustc.edu.cn/ubuntu/ noble-proposed main restricted universe multiverse
# deb-src https://mirrors.ustc.edu.cn/ubuntu/ noble-proposed main restricted universe multiverse
```

然后`sudo apt update`即可.

## 安装Miniconda3

```bash
mkdir -p ~/miniconda3
wget https://mirrors.ustc.edu.cn/anaconda/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh
bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
rm -rf ~/miniconda3/miniconda.sh
~/miniconda3/bin/conda init bash
```

重启shell即可.

然后就遇到了和Windows一样的问题, ~~我cnm~~