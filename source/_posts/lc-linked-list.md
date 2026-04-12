---
title: LeetCode Linked List 题解
tags:
  - LeetCode
  - 算法
date: 2026-04-03 22:34:55
categories: 算法
---


### Reverse Linked List

[反转链表](https://leetcode.cn/problems/reverse-linked-list/)

遍历(迭代)一遍很简单, 但是递归有点不好理解.

```cpp
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        if(head == nullptr || head->next == nullptr) {
            return head;
        }
        ListNode* newhead = reverseList(head->next);
        head->next->next = head;
        head->next = nullptr;
        return newhead;
    }
};
```

<!--more-->

### Merge Two Sorted Lists

[合并两个有序链表](https://leetcode.cn/problems/merge-two-sorted-lists/)

意料之外地有点绕.

```cpp
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy(0);
        ListNode* cur = &dummy;
        while(list1 != nullptr && list2 != nullptr) {
            if(list1->val <= list2->val) {
                cur->next = list1;
                list1 = list1->next;
            }
            else {
                cur->next = list2;
                list2 = list2->next;
            }
            cur = cur->next;
        }
        if(list1 != nullptr)
            cur->next = list1;
        else
            cur->next = list2;
        return dummy.next;
    }
};
```

### Linked List Cycle

[环形链表](https://leetcode.cn/problems/linked-list-cycle/)

可以用O(1)额外空间解决, 方法是slow每次走一步, fast每次走两步, 若相遇则有环, 挺有意思的.

```cpp
class Solution {
public:
    bool hasCycle(ListNode *head) {
        ListNode *slow, *fast;
        slow = head;
        fast = head;
        if(slow == NULL || slow->next == NULL)  return false;
        while(fast != NULL && fast->next != NULL) {
            slow = slow->next;
            fast = fast->next->next;
            if(slow == fast)
                return true;
        }
        return false;
    }
};
```

### Remove Nth Node From End of List

[删除链表的倒数第 N 个结点](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/)

类似上题的思路, dummy可以简化N和链表长度相等时的逻辑.

**在操作可能改变头节点, 或需要头节点前驱时, 考虑使用dummy.**

```cpp
class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode *slow, *fast, dummy(0, head);
        slow = fast = &dummy;
        if(head == nullptr || head->next == nullptr)  return nullptr;
        for(int i = 0; i < n; ++i)
            fast = fast->next;
        while(fast->next != nullptr) {
            slow = slow->next;
            fast = fast->next;
        }
        slow->next = slow->next->next;
        return dummy.next;
    }
};
```

### Copy List With Random Pointer

[随机链表的复制](https://leetcode.cn/problems/copy-list-with-random-pointer/)

通过把链表紧接着自己复制一遍可以省掉哈希表, 使用O(1)额外空间.

注意最后要把原链表复原, 以及复原的顺序.

```cpp
class Solution {
public:
    Node* copyRandomList(Node* head) {
        if(head == NULL)    return NULL;
        Node *cur = head;
        while(cur != NULL) {
            Node *t = (Node*)malloc(sizeof(Node));
            t->val = cur->val;
            t->next = cur->next;
            // t->random = cur->random;
            cur->next = t;
            cur = t->next;
        }
        cur = head;
        while(cur != NULL) {
            if(cur->random != NULL)
                cur->next->random = cur->random->next;
            else
                cur->next->random = NULL;
            cur = cur->next->next;
        }
        cur = head;
        Node *ans = head->next, *cur2;
        while(cur != NULL) {
            cur2 = cur->next;
            if(cur->next != NULL)
                cur->next = cur->next->next;
            if(cur2->next != NULL)
                cur2->next = cur2->next->next;
            cur = cur->next;
            // if(cur->next->next != NULL)
            //     cur->next->next = cur->next->next->next->next;
            // cur->next = cur->next->next;
            // cur = cur->next;
        }
        return ans;
    }
};
```

### Add Two Numbers

[两数相加](https://leetcode.cn/problems/add-two-numbers/)

比我想得麻烦一点.

注意:

```cpp
class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode head;
        ListNode *ans = &head;
        // ...
        return ans;
    }
}
```

这么写会RE, 因为head是局部变量, 函数运行完毕之后会销毁. 我居然这都不知道, 基本功有点差了.

然后我发现几乎所有莫名其妙的问题都能用dummy解决.

```cpp
class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode dummy;
        ListNode *cur = &dummy;
        int sum = 0, c = 0;
        while(l1 != nullptr || l2 != nullptr || c != 0) {
            sum = c;
            if(l1 != nullptr) {
                sum += l1->val;
                l1 = l1->next;
            }
            if(l2 != nullptr) {
                sum += l2->val;
                l2 = l2->next;
            }
            cur->next = new ListNode;
            cur = cur->next;
            cur->val = sum % 10;
            c = sum / 10;
        }
        return dummy.next;
    }
};
```

### Find The Duplicate Number

[寻找重复数](https://leetcode.cn/problems/find-the-duplicate-number/)

为啥这题不是Hard.

思路仍然是Floyd跑圈算法, 把数组下标看成自己的位置, 数组的值看作是指向某一位的指针, 如果存在重复数字, 则一定有一个元素存在多条指向它的边, 因此一定存在环路.

slow一次一步, fast一次两步, 最开始进入环路时, 一定是因为有两个不同的节点指向了环路的入口, 因此入口值就是重复值.

```cpp
class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        int slow, fast;
        slow = nums[0];
        fast = nums[slow];
        while(slow != fast) {
            slow = nums[slow];
            fast = nums[nums[fast]];
        }
        slow = 0;
        while(slow != fast) {
            slow = nums[slow];
            fast = nums[fast];
        }
        return slow;
    }
};
```

### Merge K Sorted Lists

[合并 K 个升序链表](https://leetcode.cn/problems/merge-k-sorted-lists/)

能想到优先队列的话还是比较直观的, 时间复杂度O(nlogk), 空间复杂度O(k).

```cpp
class Solution {
public:
    struct cmp {
        bool operator()(ListNode *a, ListNode *b) {
            return a->val > b->val;
        }
    };
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        priority_queue<ListNode*, vector<ListNode*>, cmp> pq;
        ListNode dummy;
        ListNode *cur = &dummy;
        for(int i = 0; i < lists.size(); ++i) {
            if(lists[i] != nullptr)
                pq.push(lists[i]);
        }
        while(!pq.empty()) {
            cur->next = pq.top();
            pq.pop();
            if(cur->next->next != nullptr)
                pq.push(cur->next->next);
            cur = cur->next;
        }
        return dummy.next;
    }
};
```

感觉这题Hard不如上题Medium难.

如果用分治可以做到O(1)额外空间, 但是必须用迭代不能用递归, 先合并01, 23, 34, ..., 再合并02, 46, ..., 以此类推.

### Reverse Nodes In K Group

[K 个一组翻转链表](https://leetcode.cn/problems/reverse-nodes-in-k-group/)

用头插法依次翻转链表即可, 感觉还算阳间.

```cpp
class Solution {
public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        ListNode dummy;
        dummy.next = head;
        ListNode *begin, *end;
        begin = &dummy;     // 指向当前组的前一个节点
        end = &dummy;
        while(end->next != nullptr) {
            for(int i = 0; i < k && end != nullptr; ++i)
                end = end->next;
            if(end == nullptr)
                return dummy.next;
            ListNode *cur = begin->next;    // 当前组的第一个节点
            for(int i = 0; i < k - 1; ++i) {    // 注意是 k-1 次
                ListNode *next = cur->next;
                cur->next = next->next;
                next->next = begin->next;
                begin->next = next;
            }
            begin = end = cur;  // 注意要重置指针, 初始态 begin 和 end 在一起
        }
        return dummy.next;
    }
};
```

