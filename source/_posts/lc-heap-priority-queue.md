---
title: LeetCode Heap/Priority Queue 题解
tags:
  - 算法
  - LeetCode
categories: LeetCode
date: 2026-04-16 20:39:09
---


考虑了一下决定尝试换到python.

### Kth Largest Element In a Stream

[数据流中的第 K 大元素](https://leetcode.cn/problems/jBjn9C/)

注意是第k大, 所以搞个小顶堆, 一直pop到只剩k个元素, 返回堆顶元素即可.

```python
import heapq
class KthLargest:
    def __init__(self, k: int, nums: List[int]):
        self.k = k
        self.pq = nums
        heapq.heapify(self.pq)

    def add(self, val: int) -> int:
        heapq.heappush(self.pq, val)
        while len(self.pq) > self.k:
            heapq.heappop(self.pq)
        return self.pq[0]
```

<!--more-->

### Last Stone Weight

[最后一块石头的重量](https://leetcode.cn/problems/last-stone-weight/)

Python默认只有小顶堆, 所以可以把所有数字取相反数再存进去实现大顶堆.

```Python
import heapq
class Solution:
    def lastStoneWeight(self, stones: List[int]) -> int:
        heap = []
        for i in stones:
            heapq.heappush(heap, -i)
        while len(heap) > 1:
            a = heap[0]
            heapq.heappop(heap)
            b = heap[0]
            heapq.heappop(heap)
            if a > b:
                heapq.heappush(heap, b - a)
            elif a < b:
                heapq.heappush(heap, a - b)
        if len(heap) == 0:
            return 0
        return -heap[0]
```

### K Closest Points to Origin

[最接近原点的 K 个点](https://leetcode.cn/problems/k-closest-points-to-origin/)

Python比较元组会先比较第一个元素.

```Python
import heapq
class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        h = []
        ans = []
        for i in points:
            heapq.heappush(h, (i[0] * i[0] + i[1] * i[1], i))
        for i in range(k):
            ans.append(h[0][1])
            heapq.heappop(h)
        return ans
```

也可以重写 `__lt__` 方法或者用 `dataclass` , 但没有这么方便.

### Kth Largest Element In An Array

[数组中的第K个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/)

堆可以做, 但复杂度是 O(NlogK), 我非常想知道是谁把这题放到堆的分类里的.

答案是**快速选择**.

```python
import random
class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        pivot = random.choice(nums)
        big = [x for x in nums if x > pivot]
        equal = [x for x in nums if x == pivot]
        small = [x for x in nums if x < pivot]
        if len(big) >= k:
            return self.findKthLargest(big, k)
        elif len(big) + len(equal) >= k:
            return pivot
        else:
            return self.findKthLargest(small, k - len(big) - len(equal))
            
```

### Task Scheduler

[任务调度器](https://leetcode.cn/problems/task-scheduler/)

操作系统还在追我.

贪心, 优先完成剩余次数最多的任务, 用双向队列记录冷却时间, 冷却完成之后把它放回堆里.

```Python
import heapq
from collections import Counter, deque
class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        count = Counter(tasks)
        heap = [-i for i in count.values()]
        heapq.heapify(heap)
        time = 0
        q = deque()
        while heap or q:
            time += 1
            if heap:
                cnt = heapq.heappop(heap) + 1
                if cnt != 0:
                    q.append((cnt, time + n))
            if q and q[0][1] == time:
                heapq.heappush(heap, q.popleft()[0])
        return time
```

或者, 考虑总时长是由最频繁的任务决定的, 例如n=2, 最频繁的任务是A, 则先排好A:

```
A _ _ | A _ _ | A
```

若有多个和A一样频繁的任务, 会影响最后一组的大小, 其余直接放入空位中, 若空位放不下则任意安排都不会影响总时长. 所以可以直接算.

```Python
from collections import Counter
class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        count = list(Counter(tasks).values())
        most_freq_task = max(count)
        most_freq_task_count = count.count(most_freq_task)
        return max(len(tasks), (most_freq_task-1) * (n+1) + most_freq_task_count)
```

### Find Median From Data Stream

[数据流的中位数](https://leetcode.cn/problems/find-median-from-data-stream/)

一个大顶堆放较小的一部分数, 一个小顶堆放较大的一部分数.

```Python
import heapq
class MedianFinder:
    def __init__(self):
        self.small = []     # 大顶堆
        self.big = []       # 小顶堆
        self.cur = False    # True 为奇数

    def addNum(self, num: int) -> None:
        self.cur = not self.cur
        if len(self.big) == 0 or num >= self.big[0]:
            heapq.heappush(self.big, num)
        elif len(self.small) == 0 or num <= -self.small[0]:
            heapq.heappush(self.small, -num)
        elif len(self.big) > len(self.small):
            heapq.heappush(self.small, -num)
        else:
            heapq.heappush(self.big, num)
        while len(self.big) - len(self.small) > 1:
            heapq.heappush(self.small, -heapq.heappop(self.big))
        while len(self.small) - len(self.big) > 1:
            heapq.heappush(self.big, -heapq.heappop(self.small))

    def findMedian(self) -> float:
        # print(f"big={self.big}, small={self.small}, cur={self.cur}")
        if self.cur:
            if len(self.big) > len(self.small):
                return float(self.big[0])
            else:
                return float(-self.small[0])
        else:
            return (self.big[0] - self.small[0]) / 2
```

其实push逻辑可以优化, 但我懒得改了.