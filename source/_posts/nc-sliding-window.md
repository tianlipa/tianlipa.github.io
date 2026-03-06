---
title: NeetCode 150 Sliding Window 题解
tags:
  - 算法
  - LeetCode
date: 2026-02-21 23:39:10
---


### Best Time to Buy and Sell Stock

[买卖股票的最佳时机](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/)

其实从左往右扫也可以.

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int ans = 0;
        int sell = -1;
        for(int i = prices.size() - 1; i >= 0; --i) {
            ans = max(ans, sell - prices[i]);
            sell = max(sell, prices[i]);
        }
        return ans;
    }
};
```

<!--more-->

### Longest Substring Without Repeating Characters

[无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)

滑动窗口里最多只重复一次, 不算很难.

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_set<char> flag;
        int left = 0, right = 0;
        int ans = 1, temp = 0;
        if(s.size() == 0)   return 0;
        do {
            if(flag.count(s[right])) {
                while(s[left] != s[right]) {
                    flag.erase(s[left]);
                    // cout<<"erase "<<s[left]<<endl;
                    ++left;
                    --temp;
                }
                ++left;
            }
            flag.insert(s[right]);
            // cout<<"insert "<<s[right]<<endl;
            ++temp;
            ++right;
            ans = max(ans, right - left);
        } while(left < right && right < s.size());
        return ans;        
    }
};
```

### Longest Repeating Character Replacement

[替换后的最长重复字符](https://leetcode.cn/problems/longest-repeating-character-replacement/)

解法略微有点反直觉.

对每个合法窗口, 只要找到其中出现次数最多的字母, 然后把其他所有字母都换掉. 不需要具体记录出现最多的是哪个字母, 只要记录出现最多的字母出现的次数, 每次扩展窗口时, 比较一下变化的字符和 `max_count` 哪个大即可.

**由于需要寻找的是最大的合法窗口, 可以在右移左指针的同时右移右指针, 确保窗口长度只会增加, 不考虑窗口减小的情况.**

```cpp
class Solution {
public:
    int characterReplacement(string s, int k) {
        int left = 0, right = 0;
        int ans = 0, max_count = 0;
        int count[30] = {0};
        do {
            ++count[s[right] - 'A'];
            max_count = max(max_count, count[s[right] - 'A']);
            if(right - left + 1 - max_count <= k) {
                ans = max(ans, right - left + 1);
                ++right;
            }
            else {
                --count[s[left] - 'A'];
                ++left;
                ++right;
            }
        } while(left < right && right < s.size());
        return ans;
    }
};
```

### Permutation in String

[字符串的排列](https://leetcode.cn/problems/permutation-in-string/)

实际遍历右指针应该会方便一点. 如果 `count` 数组用 `array` 或者 `vector` 还可以直接用 `==` 比较, 不过我写的时候还不知道.	

```cpp
class Solution {
public:
    bool checkInclusion(string s1, string s2) {
        if(s2.size() < s1.size())   return false;
        int count[27] = {0};
        for(int i = 0; i < s1.size(); ++i) {
            ++count[s1[i] - 'a'];
        }
        int left = 0;
        int count2[27] = {0};
        for(int i = left; i < left + s1.size(); ++i) {
            ++count2[s2[i] - 'a'];
        }
        while(left + s1.size() <= s2.size()) {
            bool flag = true;
            for(int i = 0; i < 26; ++i) {
                if(count[i] != count2[i]) {
                    flag = false;
                    break;
                }
            }
            if(flag)    return true;
            ++left;
            if(left + s1.size() > s2.size())   break;
            ++count2[s2[left + s1.size() - 1] - 'a'];
            --count2[s2[left - 1] - 'a'];
        }
        return false;
    }
};
```

### Minimum Window Substring

[最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/)

写了一坨极其丑陋的代码.

```cpp
class Solution {
public:
    string minWindow(string s, string t) {
        array<int, 60> count = {0}, count2 = {0};
        int start, len = 114514;
        if(s.size() < t.size()) return "";
        for(int i = 0; i < t.size(); ++i) {
            ++count[t[i] - 'A'];
        }
        int left = 0, right = t.size() - 1;
        for(int i = left; i <= right; ++i)
            ++count2[s[i] - 'A'];
        while(left <= right && right < s.size()) {
            bool flag = true;
            for(int i = 0; i < 60 && flag; ++i) {
                while(count2[i] < count[i]) {
                    ++right;
                    if(right >= s.size()) {
                        flag = false;
                        break;
                    }
                    ++count2[s[right] - 'A'];
                }
            }
            // for(int i = 0; i < 60; ++i) {
            //     if(count2[i] > count[i]) {
            //         while(count2[s[left] - 'A'] > count[s[left] - 'A']) {
            //             --count2[s[left] - 'A'];
            //             ++left;
            //         }
            //     }
            // }
            while(left < s.size() && count2[s[left] - 'A'] > count[s[left] - 'A']) {
                --count2[s[left] - 'A'];
                ++left;
            }
            bool ok = true;
            if(len > right - left) {
                for(int i = 0; i < 60; ++i) {
                    if(count2[i] < count[i])
                        ok = false;
                }
                if(ok) {
                    start = left;
                    len = right - left;
                }
            }
            if(left < s.size()) {
                --count2[s[left] - 'A'];
                ++left;
            }
        }
        if(len == 114514)    return "";      // 未找到符合要求的字符串
        string ans = "";
        for(int i = 0; i <= len; ++i)
            ans += s[start + i];
        return ans;
    }
};
```

### Sliding Window Maximum

[滑动窗口最大值](https://leetcode.cn/problems/sliding-window-maximum/)

可以用优先队列, 复杂度是O(nlogn), 用滑动窗口可以达到O(n), 但是我觉得挺难想到的.

核心思路是双向队列, 窗口右移, 新元素加入队尾, 同时把队尾所有比新元素小的元素踢出去(因为比新元素早离开窗口且更小, 不可能是最大值). 这样队列是单调的, 每次从队首取最大值即可.

注意这里队列存的是下标, 方便判断是否还在窗口内.

```cpp
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        deque<int> q;
        vector<int> ans;
        for(int i = 0; i < k - 1; ++i) {
            // 记得判断 empty 否则会 RE
            while(!q.empty() && nums[i] >= nums[q.back()])
                q.pop_back();
            q.push_back(i);
        }
        for(int i = k - 1; i < nums.size(); ++i) {
            while(!q.empty() && nums[i] >= nums[q.back()])
                q.pop_back();
            q.push_back(i);
            while(q.front() <= i - k || q.front() > i) {
                q.pop_front();
            }
            ans.push_back(nums[q.front()]);
        }
        return ans;
    }
};
```

一边看今天vibe coding又整了什么超牛逼大活一边让LLM教我刷算法题, 前途真是一片光明啊.