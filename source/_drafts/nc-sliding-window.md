---
title: NeetCode 150 Sliding Window 题解
tags: [算法, LeetCode]
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