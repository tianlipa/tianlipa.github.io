---
title: 智能体安全相关论文阅读
date: 2026-02-25 19:18:16
tags: [USTC-MINE, 论文阅读, LLM, LLM安全]
categories: 科研
---

## Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection

间接提示词注入(IPI), 把攻击内容放在检索数据中, 模型很难防御.

威胁:

- 信息窃取: 通过说服模型构造搜索请求, 拼接URL, 调用API, 获取用户信息.
- 诈骗: 伪造假信息.
- 恶意软件传播: AI worm
- 系统入侵: 远程控制, 持久化感染, API操控, 代码补全污染, 能达到很接近传统后门的行为.
- 生成内容操控.
- 可用性攻击: 让模型执行耗时任务, 破坏query, 插入零宽连接符, 禁止调用API等.

隐藏注入技术:

- 多阶段注入: 小注入触发模型下载更大的payload.
- 编码注入: 如base64编码prompt, 即使没有明确指示, 模型也会解码.

作者还注意到了三点:

- 攻击者可以仅仅概括攻击目标, 模型可能会自主执行(什么内鬼).
- 可以通过与主题边缘相关的上下文操纵模型生成内容.
- 模型可能会发出受注入提示影响并加强的后续 API 调用, 这对智能体尤其危险.

<!--more-->

## G-Safeguard: A Topology-Guided Security Lens and Treatment on LLM-based Multi-agent Systems

现有的防御机制主要针对单智能体, 忽略了 MAS 中智能体之间通过拓扑结构进行交互的特性. 如果一个智能体被攻击, 它产生的恶意信息会通过通信网络传播并感染其他正常的智能体.

G-Safeguard 引入了一种基于拓扑引导的"检测与修复"范式.

- **构建多智能体话语图 (Multi-agent Utterance Graph)**:
  - 在每一轮对话结束时, 系统会将智能体作为图的节点(nodes), 将它们之间的交互历史作为边(edges), 构建出一个动态的通信图 .
  - 节点的特征提取自智能体的历史记录, 而边的特征则编码了智能体之间传递的具体话语 .
- **基于图的攻击检测 (Graph-based Attack Detection)**:
  - G-Safeguard 将攻击检测形式化为图上的**节点分类问题 (node classification problem)** .
  - 它利用图神经网络(Graph Neural Network, GNN)对节点和边的特征进行迭代更新, 通过感知智能体之间的信息流, 精准识别出表现异常, 可能被攻击的高风险智能体 .
- **通过边缘剪枝进行修复 (Edge Pruning for Remediation)**:
  - 一旦检测到受损的智能体, G-Safeguard 会实施拓扑干预, 即切断(剪枝)这些高风险节点向外发送信息的边缘(outgoing edges) .
  - 这种针对性的边缘剪枝能有效阻断对抗性恶意信息的进一步传播, 保证剩余智能体之间的无污染通信 .

效果:

- **防御效果显著**: 在多种常见的拓扑结构(Chain/链状, Tree/树状, Star/星状, Random/随机)和不同的攻击策略下, G-Safeguard 都能大幅降低攻击成功率 (Attack Success Rate, ASR) . 例如, 在应对提示词注入攻击时, 它帮助系统恢复了超过 40% 的性能 .
- **规模扩展性强 (Scalability)**: 得益于图神经网络的归纳学习能力, 在一个仅有 8 个智能体的小型 MAS 上训练出的 G-Safeguard, 可以直接应用于包含高达 80 个智能体的大规模 MAS 中, 且无需重新训练即可保持稳定的防御性能 .
- **跨模型通用性与实际应用**: 该框架不仅能适应多种底层 LLM(如 GPT-4o, LLaMA-3.1-70b, Claude-3.5, Deepseek 等), 还能无缝集成到如 CAMEL 这样真实世界的主流多智能体框架中, 并在基准测试中保持 80% 以上的攻击者识别准确率 .

## THE ATTACKER MOVES SECOND: STRONGER ADAPTIVE ATTACKS BYPASS DEFENSES AGAINST LLM JAILBREAKS AND PROMPT INJECTIONS

防御必须在adaptive attacker面前评估, 攻击者应当知道防御设计, 针对防御优化攻击策略, 且拥有足够算力.

- Whilebox: 攻击者拥有模型结构, 参数, 内部状态, 梯度.
- Blackbox with logits: 可以查询模型, 获得logits或probability.
- Blackbox: 只能看到输出文本.

所有 adaptive attack 都可以抽象为一个循环:

1. Propose: 生成候选攻击
2. Score: 根据攻击效果评分
3. Select: 在多个候选中选出更有希望的攻击
4. Update: 更新策略

现有的防御都非常脆弱, 作者呼吁采用更科学的评估方法.