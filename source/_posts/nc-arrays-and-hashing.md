---
title: NeetCode 150 Arrays & Hashing 题解
date: 2026-02-14 16:13:52
tags: [LeetCode, 算法]
---

<img src="/img/nc-arrays-and-hashing/1.png" style="zoom:50%;" />

情人节是啥玩意, 真不熟.

<!--more-->

### Contains Duplicate

[存在重复元素](https://leetcode.cn/problems/contains-duplicate/)

要求时间复杂度O(n)所以不能用map, 于是用unordered_set.

unordered_set: 基于哈希表实现, 查找, 插入, 删除都是O(1)复杂度.

set: 基于红黑树实现, 有序, 复杂度O(logn). 可以顺序遍历或范围查找.

```cpp
class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> flag;
        for(int i = 0; i < nums.size(); ++i){
            flag.insert(nums[i]);
        }
        // for(int elem : flag){
        //     cout << elem << " ";
        // }
        if(flag.size() < nums.size())
            return true;
        else
            return false;
    }
};
```

### Valid Anagram

[有效的字母异位词](https://leetcode.cn/problems/valid-anagram/)

没啥好说的.

```cpp
class Solution {
public:
    bool isAnagram(string s, string t) {
        if(s.size() != t.size())
            return false;
        int a[30] = {0}, b[30] = {0};
        for(int i = 0; i < s.size(); ++i){
            ++a[(int)(s[i] - 'a')];
            ++b[(int)(t[i] - 'a')];
        }
        for(int i = 0; i < 26; ++i)
            if(a[i] != b[i])
                return false;
        return true;
    }
};
```

### Two Sum

[两数之和](https://leetcode.cn/problems/two-sum/)

同样没啥好说的.

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_set<int> diff;
        vector<int> ans(2, 0);
        for(int i = 0; i < nums.size(); ++i){
            diff.insert(target - nums[i]);
        }
        for(int i = 0; i < nums.size(); ++i){
            if(diff.find(nums[i]) != diff.end()){
                for(int j = nums.size() - 1; j > i; --j){
                    if(nums[j] == target - nums[i]){
                        // cout << i << " " << j;
                        ans[0] = i;
                        ans[1] = j;
                        return ans;
                    }
                }
            }
        }
        return ans;
    }
};
```

### Group Anagrams

[字母异位词分组](https://leetcode.cn/problems/group-anagrams/)

unordered_map平均时间复杂度也是O(1).

用string作key可以避免手写哈希函数的痛苦.

```cpp
class Solution {
private:
    struct Array {
        int data[30]={0};
    };
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        vector<vector<string>> ans;
        Array count;
        unordered_map<string, vector<string>> mp;
        // for(int i = 0; i < strs.size(); ++i) {
        //     for(int j = 0; j < 26; ++j) {
        //         count[i].data[j] = 0;
        //     }
        // }
        for(int i = 0; i < strs.size(); ++i) {
            for(int j = 0; j < strs[i].size(); ++j) {
                ++count.data[(int)(strs[i][j] - 'a')];
            }
            string str = "";
            for(int j = 0; j < 26; ++j) {
                str += to_string(count.data[j]) + '?';
                count.data[j] = 0;
            }
            mp[str].push_back(strs[i]);
        }
        for(auto it = mp.begin(); it != mp.end(); ++it) {
            ans.push_back(it->second);
            // cout<<it->first<<"hajmi"<<endl;
        }
        return ans;
    }
};
```

### Top K Frequent Elements

[前 K 个高频元素](https://leetcode.cn/problems/top-k-frequent-elements/)

正常情况可以用最小堆, 复杂度O(nlogk), 但是题目要求O(n), 所以可以使用空间复杂度更高的桶排序方法.

```cpp
class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        vector<vector<int>> bucket(nums.size()+1);
        vector<int> count(20025, 0);
        for(int i = 0; i < nums.size(); ++i) {
            nums[i] += 10001;
            ++count[nums[i]];
        }
        int maxcount = 0;
        for(int i = 0; i < count.size(); ++i) {
            if(count[i] == 0)   continue;
            bucket[count[i]].push_back(i - 10001);
        }
        int temp = k;
        vector<int> ans;
        for(int i = bucket.size() - 1; i >= 0; --i) {
            if(bucket[i].size() <= 0)   continue;
            for(auto it = bucket[i].begin(); it != bucket[i].end(); ++it) {
                if(temp <= 0)   return ans;
                ans.push_back(*it);
                temp --;
            }
            if(temp <= 0)   return ans;
        }
        return ans;
    }
};
```

### Encode and Decode Strings

https://neetcode.io/problems/string-encode-and-decode/question?list=neetcode150

主要内容是怎么在字符串列表里搞个分隔符. 计网好像学过好几个解决方案但是我忘光了, 反正没有长度要求就用了最唐的把字符串长度写出来的方法.

```cpp
class Solution {
public:

    string encode(vector<string>& strs) {
        string ans = "";
        for(int i = 0; i < strs.size(); ++i) {
            ans += "@" + to_string(strs[i].size()) + "@" + strs[i];
        }
        cout<<ans;
        return ans;
    }

    vector<string> decode(string s) {
        vector<string> ans;
        for(int i = 0; i < s.size(); ++i) {
            int len = 0;
            if(s[i] == '@') {
                len = 0;
                ++i;
                while(s[i] != '@') {
                    len = len * 10 + (int)(s[i] - '0');
                    ++i;
                    // cout<<"len="<<len<<endl;
                }
                string temp = "";
                for(int j = 0; j < len; ++j) {
                    temp += s[++i];
                }
                ans.push_back(temp);
                // cout<<"string="<<temp<<endl;
            }
        }
        return ans;
    }
};
```

### Products of Array Except Self

[除了自身以外数组的乘积](https://leetcode.cn/problems/product-of-array-except-self/)

好吧我才知道product还有乘积的意思.

题目要求不许用除法, 所以用类似前缀和的方法, 算左边所有元素的和 × 右边所有元素的和.

```cpp
class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        vector<int> left, right(nums.size() + 5);
        int temp = 1;
        // cout<<"left:"<<endl;
        for(int i = 0; i < nums.size(); ++i) {
            temp *= nums[i];
            left.push_back(temp);
            // cout<<temp<<" ";
        }
        temp = 1;
        // cout<<"\nright:"<<endl;
        for(int i = nums.size() - 1; i >= 0; --i) {
            temp *= nums[i];
            right[i] = temp;
        }
        // for(int i = 0; i < nums.size(); ++i)    cout<<right[i]<<" ";
        vector<int> ans;
        ans.push_back(right[1]);
        for(int i = 1; i < nums.size() - 1; ++i) {
            ans.push_back((int)(left[i-1] * right[i+1]));
        }
        ans.push_back(left[nums.size() - 2]);
        return ans;
    }
};
```

想优化空间复杂度的话其实right和left两个数组都是不必要的, 不过写出来容易理解一点.

### Valid Sudoku

[有效的数独](https://leetcode.cn/problems/valid-sudoku/)

没看懂这题是何意味, 查一遍就完事了, 理论时间复杂度 O(1).

想优化可以用位运算, 但是我都 O(1) 了我管你这那的.

```cpp
#include<cstring>
class Solution {
public:
    bool isValidSudoku(vector<vector<char>>& board) {
        bool flag[10];
        int num;
        for(int i = 0; i < 9; ++i) {
            memset(flag, 0, sizeof(flag));
            for(int j = 0; j < 9; ++j) {
                if(board[i][j] != '.') {
                    num = (int)(board[i][j] - '0');
                    if(flag[num])
                        return false;
                    flag[num] = true;
                }
            }
        }
        for(int i = 0; i < 9; ++i) {
            memset(flag, 0, sizeof(flag));
            for(int j = 0; j < 9; ++j) {
                if(board[j][i] != '.') {
                    num = (int)(board[j][i] - '0');
                    if(flag[num])
                        return false;
                    flag[num] = true;
                }
            }
        }
        for(int i = 0; i < 3; ++i) {
            for(int m = 0; m < 3; ++m) {
                memset(flag, 0, sizeof(flag));
                for(int j = 0; j < 3; ++j) {
                    for(int k = 0; k < 3; ++k) {
                        if(board[j + 3 * i][k + 3 * m] != '.') {
                            num = (int)(board[j + 3 * i][k + 3 * m] - '0');
                            if(flag[num])
                                return false;
                            flag[num] = true;
                        }
                    }
                }
            }
        }
        return true;
    }
};
```

### Longest Consecutive Sequence

https://neetcode.io/problems/longest-consecutive-sequence/question?list=neetcode150

本来以为是类似最长上升子序列的题, 结果闹了半天根本不关心数字出现顺序, 只要出现了就可以, 考虑unordered_map.

```cpp
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_map<int, bool> mp;
        for(int i = 0; i < nums.size(); ++i) {
            mp[nums[i]] = true;
        }
        int ans = 0;
        for(int i = 0; i < nums.size(); ++i) {
            if(mp[nums[i] - 1] != true) {
                int t = 0;
                for(int j = nums[i];; ++j) {
                    if(mp[j])   ++t;
                    else    break;
                }
                ans = (ans > t)?ans:t;
            }
        }
        return ans;
    }
};
```

这么写虽然能过NeetCode的样例但是过不了LeetCode的样例, 思考一下发现不需要unordered_map, unordered_set就可以了.

```cpp
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> st(nums.begin(), nums.end());
        int ans = 0;
        for(int i = 0; i < nums.size(); ++i) {
            if(!st.count(nums[i] - 1)) {
                int t = 0;
                for(int j = nums[i];; ++j) {
                    if(st.count(j))   ++t;
                    else    break;
                }
                ans = (ans > t)?ans:t;
            }
        }
        return ans;
    }
};
```

但是这样会在有大量重复数据的情况下超时, 可以把遍历改成这样:

```cpp
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> st(nums.begin(), nums.end());
        int ans = 0;
        for(int num : st) {
            if(!st.count(num - 1)) {
                int t = 0;
                for(int j = num;; ++j) {
                    if(st.count(j))   ++t;
                    else    break;
                }
                ans = (ans > t)?ans:t;
            }
        }
        return ans;
    }
};
```

`int num : st` 的遍历可以自动跳过重复元素, 这样就完美了.

第一小节做完了, 猜猜我能坚持多久.