---
title: LeetCode Trees 题解
date: 2026-04-04 16:00:50
tags: [LeetCode, 算法]
categories: 算法
---

终于做到搜索了.

### Invert Binary Tree

[翻转二叉树](https://leetcode.cn/problems/invert-binary-tree/)

简单的递归.

```cpp
class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if(root == nullptr) return root;
        TreeNode *t;
        t = root->left;
        root->left = invertTree(root->right);
        root->right = invertTree(t);
        return root;
    }
};
```

<!--more-->

### Maximum Depth of Binary Tree

[二叉树的最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree/)

简单的递归.

```cpp
class Solution {
public:
    int find(TreeNode *root, int cur) {
        if(root == nullptr) return cur;
        return max(find(root->left, cur + 1), find(root->right, cur + 1));
    }
    int maxDepth(TreeNode* root) {
        return find(root, 0);
    }
};
```

### Diameter of Binary Tree

[二叉树的直径](https://leetcode.cn/problems/diameter-of-binary-tree/)

中等一点的递归, 注意这里 `depth` 是相对深度.

```cpp
class Solution {
private:
    int maxd = -1;
public:
    int depth(TreeNode *root) {
        if(root == nullptr) return 0;
        int l = depth(root->left);
        int r = depth(root->right);
        maxd = max(maxd, l + r);
        return max(l, r) + 1;
    }
    int diameterOfBinaryTree(TreeNode* root) {
        depth(root);
        return maxd;
    }
};
```

### Balanced Binary Tree

[平衡二叉树](https://leetcode.cn/problems/balanced-binary-tree/)

没啥好说的.

```cpp
class Solution {
private:
    bool flag = true;
public:
    int depth(TreeNode *root) {
        if(root == nullptr || flag == false) return 0;
        int l = depth(root->left);
        int r = depth(root->right);
        if(l > r + 1 || r > l + 1)
            flag = false;
        return max(l, r) + 1;
    }
    bool isBalanced(TreeNode* root) {
        if(root == nullptr) return true;
        depth(root);
        return flag;
    }
};
```

### Same Tree

[相同的树](https://leetcode.cn/problems/same-tree/)

没啥好说的.

```cpp
class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if(p == nullptr && q == nullptr)    return true;
        if(p == nullptr || q == nullptr)    return false;
        if(p->val == q->val)
            return (isSameTree(p->left, q->left) && 
                    isSameTree(p->right, q->right));
        return false;
    }
};
```

### Subtree of Another Tree

[另一棵树的子树](https://leetcode.cn/problems/subtree-of-another-tree/)

时间复杂度好像有点高, 可以用KMP优化但是我没学过.

```cpp
class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if(p == nullptr && q == nullptr)    return true;
        if(p == nullptr || q == nullptr)    return false;
        if(p->val == q->val)
            return (isSameTree(p->left, q->left) && 
                    isSameTree(p->right, q->right));
        return false;
    }
    bool isSubtree(TreeNode* root, TreeNode* subRoot) {
        if(subRoot == nullptr)   return true;
        if(root == nullptr)   return false;
        return isSameTree(root, subRoot) ||
                isSubtree(root->left, subRoot) ||
                isSubtree(root->right, subRoot);
        return false;
    }
};
```

### Lowest Common Ancestor of a Binary Search Tree

[二叉搜索树的最近公共祖先](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-search-tree/)

主要思维难点在于, 如果当前值在p和q中间, 则当前值就是最近公共祖先.

原因: 不妨设 p < q, 则q一定在当前节点的右子树, 如果最近祖先在当前节点的左子树, 那就不可能是q的祖先了.

想通这点之后递归一下即可.

```cpp
class Solution {
public:
    TreeNode* search(TreeNode *root, int p, int q) {
        int t = root->val;
        if(t > p && t > q) {
            return search(root->left, p, q);
        }
        else if(t < p && t < q) {
            return search(root->right, p, q);
        }
        else {
            return root;
        }
    }
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        return search(root, p->val, q->val);
    }
};
```

### Binary Tree Level Order Traversal

[二叉树的层序遍历](https://leetcode.cn/problems/binary-tree-level-order-traversal/)

比较简单的方法是dfs, 同时记录节点的深度, 然后按深度整理到ans数组里. 缺点是本质还是dfs, 如果树很深可能会栈溢出.

```cpp
class Solution {
private:
    vector<vector<int>> ans;
public:
    void dfs(TreeNode* root, int depth) {
        if(root == nullptr) return;
        if(ans.size() == depth) {
            vector<int> t;
            ans.push_back(t);
        }
        ans[depth].push_back(root->val);
        dfs(root->left, depth + 1);
        dfs(root->right, depth + 1);
    }
    vector<vector<int>> levelOrder(TreeNode* root) {
        dfs(root, 0);
        return ans;
    }
};
```

标准做法应该是利用队列bfs.

```cpp
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> ans;
        if(root == nullptr) return ans;
        deque<TreeNode*> q;
        q.push_back(root);
        while(!q.empty()) {
            vector<int> currentlevel;
            int size = q.size();
            for(int i = 0; i < size; ++i) {
                currentlevel.push_back(q.front()->val);
                if(q.front()->left != nullptr)    q.push_back(q.front()->left);
                if(q.front()->right != nullptr)    q.push_back(q.front()->right);
                q.pop_front();
            }
            ans.push_back(currentlevel);
        }
        return ans;
    }
};
```

### Binary Tree Right Side View

[二叉树的右视图](https://leetcode.cn/problems/binary-tree-right-side-view/)

数据范围非常纯良, 所以可以这么写.

```cpp
class Solution {
private:
    vector<int> ans = vector<int>(105, 114514);
    int maxd = -1;
public:
    void dfs(TreeNode *root, int depth) {
        if(root == nullptr) return;
        maxd = max(maxd, depth);
        if(ans[depth] == 114514)    ans[depth] = root->val;
        dfs(root->right, depth + 1);
        dfs(root->left, depth + 1);
    }
    vector<int> rightSideView(TreeNode* root) {
        dfs(root, 0);
        ans.resize(maxd + 1);
        return ans;
    }
};
```

标准做法是这样:

```cpp
class Solution {
private:
    vector<int> ans;
public:
    void dfs(TreeNode *root, int depth) {
        if(root == nullptr) return;
        if(ans.size() == depth)    ans.push_back(root->val);
        dfs(root->right, depth + 1);
        dfs(root->left, depth + 1);
    }
    vector<int> rightSideView(TreeNode* root) {
        ans.clear();
        dfs(root, 0);
        return ans;
    }
};
```

### Count Good Nodes In Binary Tree

[统计二叉树中好节点的数目](https://leetcode.cn/problems/count-good-nodes-in-binary-tree/)

直接dfs.

```cpp
class Solution {
private:
    int ans = 0;
public:
    void dfs(TreeNode *root, int curmax) {
        if(root == nullptr) return;
        if(root->val >= curmax) {
            ++ans;
            curmax = root->val;
        }
        dfs(root->left, curmax);
        dfs(root->right, curmax);
    }
    int goodNodes(TreeNode* root) {
        if(root == nullptr) return 0;
        dfs(root, root->val);
        return ans;
    }
};
```

### Validate Binary Search Tree

[验证二叉搜索树](https://leetcode.cn/problems/validate-binary-search-tree/)

被神必边界条件数据恶心到了, 一怒之下改用 `long long`.

```cpp
class Solution {
private:
    bool flag = true;
    // const int INT_MAX = 2147483647;
public:
    void dfs(TreeNode *root, long long max, long long min) {
        if(root == nullptr) return;
        if(root->val >= max) {
            flag = false;
            return;
        }
        if(root->val <= min) {
            flag = false;
            return;
        }
        dfs(root->left, root->val, min);
        dfs(root->right, max, root->val);
    }
    bool isValidBST(TreeNode* root) {
        dfs(root, 2147483649LL, -2147483649LL);
        return flag;
    }
};
```

更好的方法是中序遍历这棵树, 因为**二叉搜索树的中序遍历一定是单调递增**的, 只要对比当前值是否大于上一个值即可.

```cpp
class Solution {
private:
    long long prev = -2147483649LL;
    // const int INT_MAX = 2147483647;
public:
    bool isValidBST(TreeNode* root) {
        if(root == nullptr) return true;
        if(!isValidBST(root->left)) return false;
        if(root-> val <= prev)  return false;
        prev = root->val;
        if(!isValidBST(root->right))    return false;
        return true;
    }
};
```

### Kth Smallest Element In a BST

[二叉搜索树中第 K 小的元素](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/)

中序遍历找第k个即可.

```cpp
class Solution {
private:
    int ans, cur;
public:
    void dfs(TreeNode *root) {
        if(root == nullptr) return;
        dfs(root->left);
        --cur;
        // cout<<root->val<<" ";
        if(cur == 0) {
            ans = root->val;
            return;
        }
        dfs(root->right);
    }
    int kthSmallest(TreeNode* root, int k) {
        cur = k;
        dfs(root);
        return ans;
    }
};
```

中序遍历也可以通过栈迭代实现, 这样在找到答案之后即可停止搜索, 无需遍历整棵树.

```cpp
class Solution {
public:
    int kthSmallest(TreeNode* root, int k) {
        TreeNode *cur = root;
        stack<TreeNode *> st;
        while(cur != nullptr || !st.empty()) {
            while(cur != nullptr) {
                st.push(cur);
                cur = cur->left;
            }
            cur = st.top();
            st.pop();
            --k;
            if(k == 0)  return cur->val;
            cur = cur->right;
        }
        return 0;
    }
};
```

### Construct Binary Tree From Preorder And Inorder Traversal

[从前序与中序遍历序列构造二叉树](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/)

当输入为

```
preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
```

时, **注意到**此时根节点是3, 3出现在中序遍历的下标1, 它左边的9就是左子树的中序遍历, 据此递归即可.

```cpp
class Solution {
public:
    TreeNode *build(span<int> preorder, span<int> inorder) {
        if(preorder.size() == 0)    return nullptr;
        TreeNode *root = new TreeNode;
        root->val = preorder[0];
        if(preorder.size() == 1)    return root;
        int i;
        for(i = 0; i < preorder.size(); ++i) {
            if(inorder[i] == preorder[0]) {
                break;
            }
        }
        span<int> pre = span(preorder).subspan(1, i);
        span<int> in = span(inorder).subspan(0, i);
        root->left = build(pre, in);
        pre = span(preorder).subspan(i + 1);    // 默认取剩余所有
        in = span(inorder).subspan(i + 1);
        root->right = build(pre, in);
        return root;
    }
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        return build(span<int>(preorder), span<int>(inorder));
    }
};
```

这样每次递归都要找一次根节点在哪, 其实可以放个unordered_map优化时间复杂度, 但是我懒得做了.

### Binary Tree Maximum Path Sum

[二叉树中的最大路径和](https://leetcode.cn/problems/binary-tree-maximum-path-sum/)

思路: 对每个节点, 返回它能提供的最大贡献(如果为负数则返回0), 并考虑把它左右子树的贡献加在一起.

能想通这点就不难了. 不过注意如果树里只有一个节点且为负值, 答案不是0.

```cpp
class Solution {
private:
    int ans;
public:
    int search(TreeNode *root) {
        if(root == nullptr) return 0;
        int left = search(root->left);
        int right = search(root->right);
        ans = max(ans, left + right + root->val);
        int t = max(root->val + left, root->val + right);
        return max(0, t);
    }
    int maxPathSum(TreeNode* root) {
        ans = root->val;
        search(root);
        return ans;
    }
};
```

### Serialize and Deserialize Binary Tree

[二叉树的序列化与反序列化](https://leetcode.cn/problems/serialize-and-deserialize-binary-tree/)

学习一下 `getline()`, `stoi()`, `to_string()` 怎么用.

```cpp
class Codec {
private:
    string s;
    TreeNode *des(list<string>& nodes) {
        string s = nodes.front();
        nodes.pop_front();
        if(s == "#")    return NULL;
        TreeNode *root = new TreeNode;
        root->val = stoi(s);
        root->left = des(nodes);
        root->right = des(nodes);
        return root;
    }
public:
    void dfs(TreeNode *root) {
        if(root == NULL)    s.append("#,");
        else {
            s.append(to_string(root->val));
            s.append(",");
            dfs(root->left);
            dfs(root->right);
        }
    }
    string serialize(TreeNode* root) {
        s = "";
        dfs(root);
        s.append("@");
        // cout<<s;
        return s;
    }
    
    TreeNode* deserialize(string data) {
        list<string> nodes;
        string s;
        stringstream ss(data);
        while(getline(ss, s, ',')) {
            nodes.push_back(s);
        }
        return des(nodes);
    }
};
```

