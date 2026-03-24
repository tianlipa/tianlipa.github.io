---
title: NeetCode 150 Stack 题解
tags:
  - LeetCode
  - 算法
date: 2026-03-06 22:46:55
---


### Valid Parentheses

[有效的括号](https://leetcode.cn/problems/valid-parentheses/)

显然.

```cpp
class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for(int i = 0; i < s.size(); ++i) {
            if(s[i] == '(' || s[i] == '[' || s[i] == '{')
                st.push(s[i]);
            else if(s[i] == ')') {
                if(st.empty())  return false;
                if(st.top() != '(') return false;
                st.pop();
            }
            else if(s[i] == ']') {
                if(st.empty())  return false;
                if(st.top() != '[') return false;
                st.pop();
            }
            else if(s[i] == '}') {
                if(st.empty())  return false;
                if(st.top() != '{') return false;
                st.pop();
            }
            else
                return false;
        }
        if(!st.empty()) return false;
        return true;
    }
};
```

<!--more-->

### Min Stack

[最小栈](https://leetcode.cn/problems/min-stack/)

对每一个元素, 额外记录它对应的此时最小元素即可, 使用额外的O(n)空间.

```cpp
class MinStack {
private:
    struct node {
        int data;
        int min;
    };
    stack<node> st;
    
public:
    MinStack() {
        
    }
    
    void push(int val) {
        if(st.empty())
            st.push({val, val});
        else
            st.push({val, min(val, st.top().min)});
    }
    
    void pop() {
        st.pop();
    }
    
    int top() {
        return st.top().data;
    }
    
    int getMin() {
        return st.top().min;
    }
};
```

字节一面题要求只能用额外的O(1)空间, 看得我猪脑过载了.

核心问题是: 如果当前最小值被弹出了, 不知道接下来的最小值是多少.

思路是: 不在栈里存数字, 而是存储"当前数字与当时的最小值的差" `diff`.

注意即使所有数据都在 `int` 范围内, `diff` 也完全有可能超出 `int` 范围.

```cpp
class MinStack {
private:
    long long diff = 0;   // diff = val - min;
    long long cur_min = 2147483647;
    stack<long long> st;
    
public:
    MinStack() {
        
    }
    
    void push(int val) {
        if(st.empty()) {
            diff = 0;
            cur_min = val;
            st.push(0);
        }
        else {
            diff = val - cur_min;
            st.push(diff);
            if(diff < 0) {
                cur_min = val;
            }
        }
    }
    
    void pop() {
        diff = st.top();
        if(diff < 0) {
            cur_min = cur_min - diff;
        }
        st.pop();
    }
    
    int top() {
        diff = st.top();
        // cout<<"diff = "<<diff<<endl;
        // cout<<"cur_min = "<<cur_min<<endl;
        if(diff >= 0)
            return (diff + cur_min);
        else
            return cur_min;
    }
    
    int getMin() {
        return cur_min;
    }
};
```

### Evaluate Reverse Polish Notation

[逆波兰表达式求值](https://leetcode.cn/problems/evaluate-reverse-polish-notation/)

真没啥好说的. 注意一下负数和运算顺序.

C++ `string` 转 `int` 可以用 `stoi()` 函数.

```cpp
class Solution {
public:
    int evalRPN(vector<string>& tokens) {
        stack<int> num;
        for(int i = 0; i < tokens.size(); ++i) {
            // 注意负数
            if((tokens[i][0] <= '9' && tokens[i][0] >= '0') ||
                (tokens[i][0] == '-' && tokens[i].size() != 1)) {
                num.push(stoi(tokens[i]));
            }
            else {
                int a = num.top();
                num.pop();
                int b = num.top();
                num.pop();
                switch (tokens[i][0]) {
                case '+':
                    num.push(b + a);
                    break;
                case '*':
                    num.push(b * a);
                    break;
                case '/':
                    num.push(b / a);    // 注意顺序!
                    break;
                case '-':
                    num.push(b - a);
                    break;
                default:
                    break;
                }
            }
        }
        return num.top();
    }
};
```

### Daily Temperatures

[每日温度](https://leetcode.cn/problems/daily-temperatures/)

正常解法单调栈, 注意要事先给 `vector` 分配空间.

```cpp
class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        vector<int> ans(temperatures.size(), 0);
        stack<int> st;
        for(int i = 0; i < temperatures.size(); ++i) {
            while(!st.empty() && temperatures[st.top()] < temperatures[i]) {
                ans[st.top()] = i - st.top();
                st.pop();
            }
            st.push(i);
        }
        return ans;
    }
};
```

可以像 Min Stack 一样压缩到只使用O(1)额外空间.

这里的关键是, 每个元素最多只会被"访问之后发现不够大再跳到下一个"一次, 下次会通过 `ans` 数组直接跳过去, 不会再次访问, 所以最终时间复杂度仍然是O(n).

```cpp
class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        vector<int> ans(temperatures.size(), 0);
        for(int i = temperatures.size() - 2; i >= 0; --i) {
            int j = i + 1;
            while(true) {
                if(temperatures[i] < temperatures[j]) {
                    ans[i] = j - i;
                    break;
                }
                else if(ans[j] == 0) {
                    ans[i] = 0;
                    break;
                }
                else {
                    j += ans[j];
                }
            }
        }
        return ans;
    }
};
```

### Car Fleet

[车队](https://leetcode.cn/problems/car-fleet/)

有点绕的一道题. 为了避免麻烦地判断到目的地之前A能不能追上B, 可以直接把每辆车到目的地剩余时间算出来.

然后其实没必要用栈, 遍历一遍就行了, 还能省点空间. 但是确实有点绕.

```cpp
class Solution {
private:
    struct Car {
        int position;
        float time;
        bool operator<(const Car& other) const {
            return position > other.position;
        }
    };
    
public:
    int carFleet(int target, vector<int>& position, vector<int>& speed) {
        vector<Car> car(position.size());
        stack<float> st;
        for(int i = 0; i < position.size(); ++i) {
            car[i].position = position[i];
            car[i].time = (target - position[i]) * 1.0 / speed[i];
        }
        sort(car.begin(), car.end());
        for(int i = 0; i < car.size(); ++i) {
            if(st.empty() || st.top() < car[i].time) {
                st.push(car[i].time);
            }
        }
        return st.size();
    }
};
```

### Largest Rectangle In Histogram

[柱状图中最大的矩形](https://leetcode.cn/problems/largest-rectangle-in-histogram/)

核心思路在于, 对于每个柱子, 怎么找到它左边和右边分别比它矮的最近两根柱子.

采用单调栈, 保证栈底到栈顶柱子高度递增, 这样入栈时, 如果遇到比栈顶矮的柱子, 则右边界已经确定, 左边界就是栈顶下一个元素所对应的柱子, 很巧妙.

```cpp
class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        stack<int> st;
        heights.push_back(0);
        int ans = 0;
        for(int i = 0; i < heights.size(); ++i) {
            if(st.empty() || heights[st.top()] <= heights[i]) {
                st.push(i);
                continue;
            }
            else {
                int t;
                while(heights[st.top()] > heights[i]) {
                    t = st.top();
                    st.pop();
                    if(st.empty()) {
                        ans = max(ans, i * heights[t]);
                        break;
                    }
                    else {
                        ans = max(ans, (i - st.top() - 1) * heights[t]);
                    }
                }
                st.push(i);
            }
        }
        return ans;
    }
};
```

