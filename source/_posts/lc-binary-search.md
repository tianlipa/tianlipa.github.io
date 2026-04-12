---
title: Leetcode Binary Search 题解
date: 2026-04-02 18:48:17
tags: [LeetCode, 算法]
categories: 算法
---

### Binary Search

[二分查找](https://leetcode.cn/problems/binary-search/)

最基础的二分, 复习一下前世记忆.

```cpp
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int n = nums.size();
        int left = 0, right = n - 1;
        while(left <= right) {
            int i = (left + right) / 2;
            if(nums[i] == target)
                return i;
            else if(nums[i] > target) {
                right = i - 1;
            }
            else {
                left = i + 1;
            }
        }
        return -1;
    }
};
```

<!--more-->

### Search a 2D Matrix

[搜索二维矩阵](https://leetcode.cn/problems/search-a-2d-matrix/)

那我问你和上题有什么区别.

```cpp
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int m = matrix.size(), n = matrix[0].size();
        int left = 0, right = m * n - 1;
        while(left <= right) {
            int i = (left + right) / 2;
            int a = i / n, b = i % n;
            cout<<a<<" "<<b<<endl;
            if(matrix[a][b] == target)
                return true;
            else if(matrix[a][b] > target)
                right = i - 1;
            else
                left = i + 1;
        }
        return false;
    }
};
```

### Koko Eating Bananas

[爱吃香蕉的珂珂](https://leetcode.cn/problems/koko-eating-bananas/)

一亿个小时吃了一万亿根香蕉的不灭大胃袋.

直接在答案取值范围内二分查找即可.

```cpp
class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int h) {
        int n = piles.size();
        int maxp = -1;
        for(int i = 0; i < n; ++i)
            maxp = max(maxp, piles[i]); 
        int left = 1, right = maxp;
        int v, ok;
        while(left <= right) {
            v = (left + right) / 2;
            unsigned long long time = 0;
            for(int i = 0; i < n; ++i) {
                time += piles[i] / v;
                if(piles[i] % v != 0)
                    ++time;
            }
            if(time <= h) {
                ok = v;
                right = v - 1;
            }
            else {
                left = v + 1;
            }
        }
        return ok;
    }
};
```

### Find Minimum In Rotated Sorted Array

[寻找旋转排序数组中的最小值](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/)

二分查找拐点在哪里即可. 注意一般情况下比较 mid 和 right 更为恰当, 否则无法区分"拐点在右边"和"没有拐点(没有旋转)"的情况, 但我这里最开始用if把没有旋转的情况直接过掉了, 事后看题解才发现. 有一说一我写得挺唐的.

```cpp
class Solution {
public:
    int findMin(vector<int>& nums) {
        if(nums[0] < nums[nums.size() - 1] || nums.size() == 1)
            return nums[0];
        int left = 0, right = nums.size() - 1;
        int mid;
        while(left <= right) {
            mid = (left + right) / 2;
            if(nums[mid + 1] < nums[mid])
                return nums[mid + 1];
            else if(nums[mid] < nums[left])
                right = mid - 1;
            else
                left = mid + 1;
        }
        return -1;
    }
};
```

### Search In Rotated Sorted Array

[搜索旋转排序数组](https://leetcode.cn/problems/search-in-rotated-sorted-array/)

比较笨的方法是二分查找到拐点在哪, 然后用取模把数组映射成未旋转的情况, 然后再二分一次.

```cpp
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int k = -1, n = nums.size();
        if(nums[0] < nums[nums.size() - 1])
            k = 0;
        if(nums.size() == 1) {
            if(nums[0] == target)   return 0;
            return -1;
        }
        int left = 0, right = nums.size() - 1;
        int mid;
        while(left <= right and k == -1) {
            mid = (left + right) / 2;
            if(nums[mid + 1] < nums[mid]) {
                k = mid + 1;
                break;
            }
            else if(nums[mid] < nums[left])
                right = mid - 1;
            else
                left = mid + 1;
        }
        cout<<"k="<<k<<endl;
        left = 0;
        right = nums.size() - 1;
        while(left <= right) {
            mid = (left + right) / 2;
            // 提交的时候漏了这个除以 2, 实际上会退化成线性搜索
            // 然后发现不仅能过而且速度遥遥领先
            // 加上除以 2 之后运行速度从第一梯队掉到了最后梯队, 不知道这题是什么鬼数据
            if(nums[(mid + k) % n] == target)
                return (mid + k) % n;
            else if(nums[(mid + k) % n] > target)
                right = (mid - 1);
            else
                left = (mid + 1);
        }
        return -1;
    }
};
```

比较优雅的方法是, 注意到把数组分成左右两段, 一定有一段是有序的:

![](/img/lc-binary-search/1.png)

这样一次二分就可以写完.

### Find Minimum In Rotated Sorted Array II

[寻找旋转排序数组中的最小值 II](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array-ii/)

主要问题在于 mid 和 right 所对应的值相等时无法区分拐点在左边还是右边, 但注意到此时把right - 1一定不会造成影响.

另外这里 `right = mid` 不能写成 `right = mid - 1` , 因为这样会跳过mid为最小值的情况.

```cpp
class Solution {
public:
    int findMin(vector<int>& nums) {
        if(nums[0] < nums[nums.size() - 1] || nums.size() == 1)
            return nums[0];
        int left = 0, right = nums.size() - 1;
        int mid;
        while(left < right) {
            mid = left + (right - left) / 2;	// 防止溢出
            if(nums[mid] > nums[right])
                left = mid + 1;
            else if(nums[mid] < nums[right])
                right = mid;
            else
                right--;
        }
        return nums[left];
    }
};
```

### Median of Two Sorted Arrays

[寻找两个正序数组的中位数](https://leetcode.cn/problems/median-of-two-sorted-arrays/)

写得我很痛苦的一道题, 本质是找到数组里第 k 大的数, 每次二分考虑两个数组的前 `k/2` 个元素, 筛掉更小的 `k/2` 个二分即可.

```cpp
class Solution {
public:
    double findk(vector<int>& nums1, int i, vector<int>& nums2, int j, int k) {
        int m = nums1.size(), n = nums2.size();
        if(i == m)  return nums2[j + k - 1];
        if(j == n)  return nums1[i + k - 1];
        if(k == 1)
            return min(nums1[i], nums2[j]);
        if(k/2 + i >= m) {
            if(nums1[m - 1] >= nums2[j + k/2 - 1])
                return findk(nums1, i, nums2, j + k/2, k - k/2);
            else
                return findk(nums1, m, nums2, j, k - (m - i));  // 这样优雅一点
        }
        else if(k/2 + j >= n) {
            if(nums2[n - 1] >= nums1[i + k/2 - 1])
                return findk(nums1, i + k/2, nums2, j, k - k/2);
            else
                return findk(nums1, i, nums2, n, k - (n - j));
        }
        else {
            if(nums1[i + k/2 - 1] >= nums2[j + k/2 - 1]) {
                return findk(nums1, i, nums2, j + k/2, k - k/2);
            }
            else {
                return findk(nums1, i + k/2, nums2, j, k - k/2);
            }
        }
    }
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        int m = nums1.size(), n = nums2.size();
        if((m + n) % 2 == 1) {
            return findk(nums1, 0, nums2, 0, (m + n) / 2 + 1);
        }
        else {
            return (findk(nums1, 0, nums2, 0, (m + n) / 2) + findk(nums1, 0, nums2, 0, (m + n) / 2 + 1)) / 2;
        }
    }
};
```

更好的方法是, 找中位数实际上是找一个分割, 如果在 nums1 的i处, nums2的j处切割, j可以通过i算出, 只需满足 `nums1[i-1] <= nums2[j]` 且 `nums2[j-1] <= nums1[i]`, 二分查找i即可.

并且不妨设nums1比nums2短, 否则交换两个数组, 可以明显简化代码.