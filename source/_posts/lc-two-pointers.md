---
title: LeetCode Two Pointers 题解
tags:
  - LeetCode
  - 算法
date: 2026-02-19 18:51:56
categories: LeetCode
---


### Valid Palindrome

[验证回文串](https://leetcode.cn/problems/valid-palindrome/)

没啥好说的.

```cpp
class Solution {
public:
    bool isPalindrome(string s) {
        int left = 0, right = s.size() - 1;
        for(int i = 0; i < s.size(); ++i) {
            if(s[i] <= 'Z' && s[i] >= 'A') {
                s[i] = s[i] + 'a' - 'A';
            }
        }
        // cout<<s;
        while(left <= right) {
            if(!(s[left] <= 'z' and s[left] >='a') and !(s[left] <= '9' and s[left] >= '0')) {
                ++left;
                continue;
            }
            if(!(s[right] <= 'z' and s[right] >='a') and !(s[right] <= '9' and s[right] >= '0')) {
                --right;
                continue;
            }
            if(s[left++] != s[right--])
                return false;
        }
        return true;
    }
};
```

<!--more-->

### Two Integer Sum II

[两数之和 II - 输入有序数组](https://leetcode.cn/problems/kLl5u1/)

双指针扫一下, 如果加起来小了就右移左指针, 反之左移右指针.

显然解对应的元素有一左一右两个, 不妨称之为a和b, 且a < b. 如果出现了找不到解的情况, 说明在找到a之前就扫过了b, 或者在找到b之前就扫过了a. 考虑前者, 这说明a左侧的元素m满足m + b > target, 这显然是扯淡, 故解法成立.

另外这题NeetCode上下标从1计数, LeetCode上从0计数, 也不知道在干啥.

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        vector<int> ans;
        int left = 0, right = numbers.size() - 1;
        while(left < right) {
            if(numbers[left] + numbers[right] < target) {
                ++left;
                continue;
            }
            else if(numbers[left] + numbers[right] > target) {
                --right;
                continue;
            }
            else if(numbers[left] + numbers[right] == target){
                ans.push_back(left + 1);
                ans.push_back(right + 1);
                return ans;
            }
        }
    }
};
```

### 3Sum

[三数之和](https://leetcode.cn/problems/1fGaJU/)

可以先排序然后用类似上一题的方法. 我的第一反应是遍历中间那个数, 然后使用left和right两个指针, 但是这样很不方便去重, 最佳方法是遍历最左边的数字, 有重复就可以直接跳过.

注意处理一下 `nums.size() < 3` 的情况.

```cpp
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        vector<vector<int>> ans;
        sort(nums.begin(), nums.end());
        if(nums.size() <= 2)    return ans;
        for(int i = 0; i < nums.size() - 2; ++i) {
            if(i > 0 && nums[i] == nums[i - 1]) continue;
            if(nums[i] > 0) break;      // 优化
            int left = i + 1, right = nums.size() - 1;
            while(left < right) {
                if(nums[left] + nums[right] + nums[i] < 0) {
                    ++left;
                    continue;
                }
                else if(nums[left] + nums[right] + nums[i] > 0) {
                    --right;
                    continue;
                }
                else if(nums[left] + nums[right] + nums[i] == 0) {
                    ans.push_back({nums[left], nums[right], nums[i]});
                    while(left < right and nums[left] == nums[left + 1])    ++left;
                    while(left < right and nums[right] == nums[right - 1])    --right;
                    ++left;
                    --right;
                }
            }
        }
        return ans;
    }
};
```

### Container With Most Water

[盛最多水的容器](https://leetcode.cn/problems/container-with-most-water/)

没啥好说的嗯.

```cpp
class Solution {
public:
    int maxArea(vector<int>& heights) {
        int ans = -1;
        int left = 0, right = heights.size() - 1;
        while(left < right) {
            int temp = (right - left) * min(heights[right], heights[left]);
            ans = (ans > temp)?ans:temp;
            if(heights[left] < heights[right]) {
                ++left;
                continue;
            }
            else if(heights[left] > heights[right]) {
                --right;
                continue;
            }
            else {
                ++left;
                --right;
            }
        }
        return ans;     
    }
};
```

### Trapping Rain Water

[接雨水](https://leetcode.cn/problems/trapping-rain-water/)

久仰大名. 可以用动态规划的方法, 比较容易理解, 空间复杂度 O(n):

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        vector<int> leftmax(height.size() + 5);
        vector<int> rightmax(height.size() + 5);
        // leftmax[0] = rightmax[0] = leftmax[height.size() - 1] = rightmax[height.size() - 1] = 0;
        int temp = height[0];
        for(int i = 0; i < height.size(); ++i) {
            leftmax[i] = temp;
            temp = (temp > height[i])?temp:height[i];
        }
        temp = height[height.size() - 1];
        for(int i = height.size() - 1; i >= 0; --i) {
            rightmax[i] = temp;
            temp = (temp > height[i])?temp:height[i];
        }
        int ans = 0;
        for(int i = 0; i < height.size(); ++i) {
            ans += max(0, min(leftmax[i], rightmax[i]) - height[i]);
        }
        return ans;
    }
};
```

也可以用单调栈, 但是看得我有点猪脑过载就没写.

如果要求空间复杂度O(1)可以用双指针:

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int lmax = 0, rmax = 0;
        int ans = 0;
        while(left < right) {
            if(height[left] < height[right]) {
                if(height[left] < lmax) {
                    ans += lmax - height[left];
                }
                else {
                    lmax = (lmax > height[left])?lmax:height[left];
                }
                ++left;
            }
            else {
                if(height[right] < rmax) {
                    ans += rmax - height[right];
                }
                else {
                    rmax = (rmax > height[right])?rmax:height[right];
                }
                --right;
            }
        }
        return ans;
    }
};
```