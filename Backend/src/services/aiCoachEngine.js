// backend/src/services/aiCoachEngine.js
/**
 * AI Study Coach & Tutor Engine
 * Dual-mode AI tutor:
 * 1. Cloud AI: Uses Gemini API (if GEMINI_API_KEY or GOOGLE_API_KEY is configured)
 * 2. Intelligent Built-in Knowledge Base: Rich, multi-domain offline academic reasoning engine
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

/**
 * Knowledge Base definitions for curriculum topics
 */
const KNOWLEDGE_BASE = [
  // 1. Greetings & Bot Introduction
  {
    triggers: ['hi', 'hello', 'hey', 'greetings', 'who are you', 'what can you do', 'help me', 'start'],
    exactMatches: ['hi', 'hello', 'hey', 'help'],
    category: 'General Guidance',
    respond: ({ studentName }) => ({
      text: `Hello ${studentName || 'Student'}! 👋 I am your **AI Study Coach & Tutor** at E-Study Corner.\n\nI can help you with:\n• **Concept Explanations**: Deep dive into DSA, SQL, Web Dev, OS, Networks, C++, Java, and Python.\n• **Code & Syntax**: Working code examples with best practices and complexity analysis.\n• **Interactive Practice**: Targeted quiz questions and diagnostic exercises.\n• **Study Plans**: Custom 7-day or 30-day revision timetables.\n• **Performance Diagnostics**: Personalized review based on your actual quiz scores.\n\nWhat topic would you like to master today?`,
      explanation: `I am your personal AI Study Coach & Academic Tutor at E-Study Corner. You can ask me questions on any topic in Computer Science, request code implementations, generate practice questions, or ask for personalized study strategies.`,
      codeSnippet: `// Example: Ask me "Explain Binary Search Tree deletion with code"
// Or click any of the suggested prompt chips below!`,
      codeLanguage: 'javascript',
      practiceQuestions: [
        'Explain the difference between Time and Space Complexity in algorithms.',
        'What are the ACID properties in database management systems?',
        'How does the JavaScript Event Loop handle microtasks and macrotasks?'
      ],
      recommendedTopic: 'Data Structures & Core Foundations',
      keyTakeaways: [
        'Interactive 24/7 AI tutor for computer science & engineering students.',
        'Supports code generation, practice questions, and personalized weak-topic analysis.'
      ],
      suggestedFollowUps: [
        'Explain Binary Search Tree deletion logic with code',
        'What is the difference between INNER JOIN and LEFT JOIN in SQL?',
        'Analyze my weak areas based on recent quiz scores'
      ]
    })
  },

  // 2. Appreciation / Gratitude
  {
    triggers: ['thank you', 'thanks', 'awesome', 'great', 'got it', 'understood', 'perfect'],
    exactMatches: ['thanks', 'thank you', 'ok', 'okay', 'great'],
    category: 'Conversational',
    respond: () => ({
      text: `You're very welcome! Keep up the momentum! 🚀\n\nThe best way to lock in this concept is to write the code yourself without looking, or solve a quick practice question. Would you like a challenging follow-up question or shall we explore another topic?`,
      explanation: `Great job engaging with the material! Regular active recall and spaced repetition are the most effective techniques for long-term retention.`,
      codeSnippet: ``,
      codeLanguage: 'text',
      practiceQuestions: [
        'Would you like a diagnostic quiz question on this topic?',
        'Shall we move on to the next related topic in your syllabus?'
      ],
      recommendedTopic: 'Active Practice & Quiz Verification',
      keyTakeaways: ['Consistent deliberate practice leads to conceptual mastery.'],
      suggestedFollowUps: [
        'Give me a tricky quiz question on this topic',
        'Create a 7-Day Comprehensive Exam Revision Schedule'
      ]
    })
  },

  // 3. Student Performance & Weak Areas Diagnosis
  {
    triggers: ['weak', 'analyze my weak', 'diagnostic', 'performance', 'quiz score', 'how am i doing', 'improve score'],
    category: 'Academic Diagnostics',
    respond: ({ attempts = [], averageScore, studentName }) => {
      const count = attempts.length;
      if (count === 0) {
        return {
          text: `Hello ${studentName || 'Student'}, you haven't attempted any diagnostic quizzes yet! 🎯\n\nTo build your personalized weak-topic map, head over to the **Quizzes & Practice** section and take your first assessment. In the meantime, I recommend starting with fundamental Data Structures and Core DBMS concepts.`,
          explanation: `Diagnostic analysis requires at least one completed quiz attempt. Taking a diagnostic quiz allows the platform to identify specific sub-topics where accuracy is under 70%.`,
          codeSnippet: `// Step 1: Complete a module quiz
// Step 2: Return here for a targeted remedial study roadmap!`,
          codeLanguage: 'javascript',
          practiceQuestions: [
            'Take the introductory DSA Diagnostic Quiz in the Quizzes tab.',
            'Review SQL basics before taking the Relational Databases quiz.'
          ],
          recommendedTopic: 'Fundamental Problem Solving & Core Concepts',
          keyTakeaways: [
            'Zero quiz attempts recorded yet.',
            'Complete assessments to generate empirical weak-topic benchmarks.'
          ],
          suggestedFollowUps: [
            'Explain Binary Search Tree deletion logic with code',
            'What is the difference between INNER JOIN and LEFT JOIN in SQL?'
          ]
        };
      }

      const lowestQuiz = [...attempts].sort((a, b) => (a.percentage || 0) - (b.percentage || 0))[0];
      const highestQuiz = [...attempts].sort((a, b) => (b.percentage || 0) - (a.percentage || 0))[0];

      return {
        text: `📊 **Personalized Academic Performance Analysis for ${studentName || 'You'}**:\n\n• **Attempts Logged**: ${count} quiz session(s)\n• **Average Accuracy**: ${averageScore}%\n• **Strongest Assessment**: "${highestQuiz?.quizTitle || 'Assessment'}" (${highestQuiz?.percentage || 0}% score)\n• **Primary Focus Area**: "${lowestQuiz?.quizTitle || 'Assessment'}" (${lowestQuiz?.percentage || 0}% score)\n\n**Actionable Remediation Strategy**:\n1. Re-read the explanations for every incorrectly answered question in "${lowestQuiz?.quizTitle || 'your weakest quiz'}".\n2. Solve 3-5 worked examples on that specific topic before re-attempting the quiz.\n3. Keep a dedicated error log notebook for edge cases.`,
        explanation: `Based on your ${count} quiz attempt(s) with an overall score of ${averageScore}%, your diagnostic profile shows that focusing remedial effort on "${lowestQuiz?.quizTitle || 'challenging topics'}" will yield the highest performance improvement.`,
        codeSnippet: `// Remedial Protocol:\n// 1. Isolate weak sub-topic: ${lowestQuiz?.quizTitle || 'Core Focus'}\n// 2. Active review -> Re-quiz in 48 hours\n// 3. Goal: Achieve >= 85% on retake`,
        codeLanguage: 'text',
        practiceQuestions: [
          `Review incorrect options from your "${lowestQuiz?.quizTitle || 'recent'}" attempt.`,
          'Explain the core mechanism aloud without referencing notes.'
        ],
        recommendedTopic: lowestQuiz?.quizTitle ? `Remedial: ${lowestQuiz.quizTitle}` : 'Targeted Revision',
        keyTakeaways: [
          `Overall diagnostic score: ${averageScore}% across ${count} assessment(s).`,
          `Targeted remediation on "${lowestQuiz?.quizTitle || 'weak topics'}" will maximize overall GPA.`
        ],
        suggestedFollowUps: [
          `Explain key concepts of ${lowestQuiz?.quizTitle || 'Data Structures'}`,
          'Create a 7-Day Comprehensive Exam Revision Schedule'
        ]
      };
    }
  },

  // 4. Study Plans & Revision Timetable
  {
    triggers: ['plan', 'schedule', 'timetable', 'revision', 'exam prep', 'study routine', '7-day', '30-day'],
    category: 'Study Strategy',
    respond: ({ averageScore }) => ({
      text: `📅 **High-Yield 7-Day Strategic Revision Timetable**:\n\n` +
        `• **Days 1–2 (Foundation & Core Concepts)**: Review fundamental theory and high-frequency definitions (DSA, DBMS, OS). Spend 45 minutes on concept review and 15 minutes summarizing in your own words.\n` +
        `• **Days 3–4 (Worked Examples & Code Implementation)**: Solve standard algorithmic problems (BST, Linked Lists, Sorting) and write raw SQL queries from scratch.\n` +
        `• **Days 5–6 (Timed Diagnostic Assessments & Error Analysis)**: Complete timed quizzes on E-Study Corner. Re-evaluate every mistake and pin notes for quick morning reference.\n` +
        `• **Day 7 (Full Mock Exam & Mental Readiness)**: Take a comprehensive mock test under exam conditions. Spend the evening resting and reviewing high-yield cheat sheets.\n\n` +
        `${averageScore ? `💡 *Note: Tailor extra time towards subjects under your current ${averageScore}% average score.*` : ''}`,
      explanation: `A structured 7-day spaced repetition schedule balances theoretical retention, practical coding synthesis, and timed diagnostic testing to maximize exam performance while preventing burnout.`,
      codeSnippet: `// Daily Study Structure (Pomodoro):\n// 50 mins: Deep Focus (No phone/tabs)\n// 10 mins: Active Recall Break (Explain concept)\n// Repeat x3 sessions daily`,
      codeLanguage: 'text',
      practiceQuestions: [
        'Identify your two lowest-scoring topics to schedule on Days 1 and 2.',
        'Which core algorithms have you not implemented from scratch in the last 14 days?'
      ],
      recommendedTopic: 'Structured Exam Timetable & Active Recall',
      keyTakeaways: [
        'Spaced repetition out-performs cramming by over 200% in empirical retention.',
        'Prioritize active problem-solving over passive slide reading.'
      ],
      suggestedFollowUps: [
        'Analyze my weak areas based on recent quiz scores',
        'Explain Binary Search Tree deletion logic with code'
      ]
    })
  },

  // 5. Binary Search Trees & Tree Algorithms
  {
    triggers: ['tree', 'bst', 'binary search tree', 'avl', 'in-order', 'pre-order', 'post-order', 'inorder', 'preorder'],
    category: 'Data Structures & Algorithms',
    respond: () => ({
      text: `🌲 **Binary Search Tree (BST) Architecture & Deletion Mechanics**\n\n` +
        `In a BST, for every node:\n• All keys in the **left subtree** are strictly smaller: \`key(left) < key(node)\`\n• All keys in the **right subtree** are strictly greater: \`key(right) > key(node)\`\n\n` +
        `**Deletion Logic (3 Critical Cases)**:\n` +
        `1. **Node is a Leaf (0 children)**: Directly remove the node and update parent pointer to \`nullptr\`.\n` +
        `2. **Node has 1 Child**: Bypass the node by linking its parent directly to its single child.\n` +
        `3. **Node has 2 Children**: Find the **in-order successor** (the smallest node in the right subtree) or in-order predecessor. Copy its value into the target node, then recursively delete that successor from the right subtree.\n\n` +
        `**Time Complexities**:\n• Search / Insert / Delete: **O(h)** where \`h\` is tree height.\n• Balanced BST (AVL/Red-Black): **O(log N)** average and worst-case.\n• Skewed BST: Degenerates into a linked list with **O(N)**.`,
      explanation: `In a Binary Search Tree (BST), every key in the left subtree is smaller than the node and every key in the right subtree is larger. Deletion has three cases: remove a leaf, replace a node with one child, or replace a node with its in-order successor when it has two children. Search, insertion, and deletion are O(log N) on average, but O(N) in a skewed tree.`,
      codeSnippet: `// C++ Binary Search Tree Deletion Implementation
struct Node {
    int val;
    Node* left;
    Node* right;
    Node(int v) : val(v), left(nullptr), right(nullptr) {}
};

Node* findMin(Node* root) {
    while (root && root->left) root = root->left;
    return root;
}

Node* deleteNode(Node* root, int key) {
    if (!root) return nullptr;

    if (key < root->val) {
        root->left = deleteNode(root->left, key);
    } else if (key > root->val) {
        root->right = deleteNode(root->right, key);
    } else {
        // Case 1: Leaf node or Case 2: One child
        if (!root->left) {
            Node* temp = root->right;
            delete root;
            return temp;
        } else if (!root->right) {
            Node* temp = root->left;
            delete root;
            return temp;
        }
        // Case 3: Two children (in-order successor)
        Node* temp = findMin(root->right);
        root->val = temp->val;
        root->right = deleteNode(root->right, temp->val);
    }
    return root;
}`,
      codeLanguage: 'cpp',
      practiceQuestions: [
        'What is the worst-case time complexity of an unbalanced BST and how do AVL rotations prevent it?',
        'Explain why an in-order traversal of a BST always yields values in strictly sorted ascending order.'
      ],
      recommendedTopic: 'Binary Search Trees & Re-balancing (AVL / Red-Black)',
      keyTakeaways: [
        'In-order successor is the smallest node in the right subtree (minimum of root->right).',
        'Balanced trees guarantee O(log N) search, insertion, and deletion.'
      ],
      suggestedFollowUps: [
        'Explain AVL tree rotations with examples',
        'How does a Graph BFS differ from a Tree Level Order traversal?'
      ]
    })
  },

  // 6. Graphs & Graph Algorithms (BFS, DFS, Dijkstra)
  {
    triggers: ['graph', 'bfs', 'dfs', 'dijkstra', 'shortest path', 'topological sort', 'bellman'],
    category: 'Data Structures & Algorithms',
    respond: () => ({
      text: `🕸️ **Graph Algorithms: BFS, DFS & Dijkstra Shortest Path**\n\n` +
        `**Representations**:\n• **Adjacency List**: Space O(V + E), optimal for sparse graphs.\n• **Adjacency Matrix**: Space O(V²), optimal for dense graphs and O(1) edge lookups.\n\n` +
        `**Traversals**:\n• **BFS (Breadth-First Search)**: Uses a **Queue (FIFO)**. Traverses level by level. Ideal for shortest path on unweighted graphs. Time: O(V + E).\n• **DFS (Depth-First Search)**: Uses a **Stack (LIFO)** or recursion. Explores as far as possible down each branch before backtracking. Used for cycle detection and topological sorting.\n\n` +
        `**Dijkstra's Algorithm**:\n• Finds shortest path from single source to all vertices on **weighted graphs with non-negative edges**.\n• Greedy strategy using a **Min-Priority Queue (Heap)**. Time complexity: **O((V + E) log V)**.`,
      explanation: `Graphs model relationships between entities. BFS traverses level-by-level using a queue, finding unweighted shortest paths. DFS explores deeply using a stack or recursion. Dijkstra uses a min-heap to compute single-source shortest paths on non-negative weighted graphs in O((V+E) log V).`,
      codeSnippet: `// Python Dijkstra's Algorithm using Min-Heap (heapq)
import heapq

def dijkstra(graph, start):
    # graph: dict of {node: [(neighbor, weight)]}
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]  # (distance, node)

    while pq:
        curr_dist, u = heapq.heappop(pq)

        if curr_dist > distances[u]:
            continue

        for v, weight in graph[u]:
            dist = curr_dist + weight
            if dist < distances[v]:
                distances[v] = dist
                heapq.heappush(pq, (dist, v))

    return distances`,
      codeLanguage: 'python',
      practiceQuestions: [
        'Why does Dijkstra fail on graphs with negative edge weights, and which algorithm solves this (Bellman-Ford)?',
        'How do you detect a cycle in a directed graph using DFS (graph coloring / recursion stack)?'
      ],
      recommendedTopic: 'Graph Algorithms & Minimum Spanning Trees (Prim/Kruskal)',
      keyTakeaways: [
        'BFS = Queue (unweighted shortest path); DFS = Stack/Recursion (cycle detection, topo sort).',
        'Dijkstra requires non-negative edge weights; use Bellman-Ford for negative weights.'
      ],
      suggestedFollowUps: [
        'Explain Dynamic Programming memoization vs tabulation',
        'How does Floyd Warshall compute all-pairs shortest paths?'
      ]
    })
  },

  // 7. Dynamic Programming & Recursion
  {
    triggers: ['dynamic programming', 'dp', 'memoization', 'tabulation', 'knapsack', 'fibonacci', 'subsequence', 'lcs'],
    category: 'Algorithms & Problem Solving',
    respond: () => ({
      text: `🧩 **Dynamic Programming (DP): Memoization vs Tabulation**\n\n` +
        `DP applies when a problem exhibits:\n1. **Optimal Substructure**: Solution to problem contains optimal solutions to subproblems.\n2. **Overlapping Subproblems**: Same subproblems are computed repeatedly.\n\n` +
        `**Two Approaches**:\n• **Top-Down (Memoization)**: Write natural recursion and cache results in an array or hash map. Solves only required subproblems.\n• **Bottom-Up (Tabulation)**: Fill a table iteratively starting from base cases. Avoids recursion call-stack overhead and enables space optimization.`,
      explanation: `Dynamic programming breaks complex optimization problems into overlapping subproblems. Top-down memoization caches recursive results, while bottom-up tabulation iteratively solves subproblems from base cases up, eliminating stack overflow risks and enabling memory reduction.`,
      codeSnippet: `// 0/1 Knapsack Problem (Bottom-Up Tabulation in Python)
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(1, capacity + 1):
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i - 1][w], values[i - 1] + dp[i - 1][w - weights[i - 1]])
            else:
                dp[i][w] = dp[i - 1][w]

    return dp[n][capacity]  # Time: O(N * W), Space: O(N * W)`,
      codeLanguage: 'python',
      practiceQuestions: [
        'How can the space complexity of the 0/1 Knapsack be optimized from O(N*W) to O(W)?',
        'Explain the recurrence relation for Longest Common Subsequence (LCS).'
      ],
      recommendedTopic: 'Dynamic Programming: Knapsack & Longest Common Subsequence',
      keyTakeaways: [
        'Identify state variables: what uniquely defines a subproblem?',
        'Formulate base cases first, then write transition formula.'
      ],
      suggestedFollowUps: [
        'Explain Binary Search Tree deletion logic with code',
        'How does Big-O notation evaluate worst-case algorithm complexity?'
      ]
    })
  },

  // 8. SQL Joins & Relational Database Queries
  {
    triggers: ['sql', 'join', 'inner join', 'left join', 'right join', 'full join', 'cross join', 'group by', 'having'],
    category: 'Database Management Systems',
    respond: () => ({
      text: `🗄️ **SQL Relational JOINs Deep Dive**\n\n` +
        `JOINs combine rows from two or more tables based on a related column:\n\n` +
        `• **INNER JOIN**: Returns only rows where matching values exist in **both** tables.\n` +
        `• **LEFT (OUTER) JOIN**: Returns **all** rows from the left table, plus matched rows from the right table. If no match exists, right columns are populated with \`NULL\`.\n` +
        `• **RIGHT (OUTER) JOIN**: Returns all rows from the right table, matched left rows, and \`NULL\` for unmatched left columns.\n` +
        `• **FULL OUTER JOIN**: Returns rows when there is a match in *either* table, padding unmatched sides with \`NULL\`.\n` +
        `• **CROSS JOIN**: Produces the Cartesian product of both tables (\`M * N\` rows).\n\n` +
        `💡 *Filtering Tip*: Use \`WHERE\` to filter individual rows before aggregation; use \`HAVING\` to filter aggregated groups after \`GROUP BY\`.`,
      explanation: `SQL JOINs combine rows using a related column. INNER JOIN keeps only matching rows from both tables, while LEFT JOIN keeps every row from the left table and fills unmatched right-side columns with NULL.`,
      codeSnippet: `-- Practical Join and Aggregation Query
SELECT 
    Students.id,
    Students.name,
    Courses.title AS course_title,
    AVG(Submissions.grade) AS average_grade
FROM Students
INNER JOIN Enrollments ON Students.id = Enrollments.student_id
INNER JOIN Courses ON Enrollments.course_id = Courses.id
LEFT JOIN Submissions ON Students.id = Submissions.student_id
GROUP BY Students.id, Students.name, Courses.title
HAVING AVG(Submissions.grade) >= 75
ORDER BY average_grade DESC;`,
      codeLanguage: 'sql',
      practiceQuestions: [
        'What happens when a LEFT JOIN finds no match in the right table?',
        'Which normal form eliminates partial dependencies, and why are surrogate keys used?'
      ],
      recommendedTopic: 'Database Normalization (3NF & BCNF) and Indexing',
      keyTakeaways: [
        'INNER JOIN filters non-matching records; LEFT JOIN preserves all left-side entities.',
        'Always index foreign key join columns to prevent expensive full-table scans.'
      ],
      suggestedFollowUps: [
        'Explain Database Normalization from 1NF to BCNF',
        'What are ACID properties and how do transactions enforce them?'
      ]
    })
  },

  // 9. Database Normalization & ACID Properties
  {
    triggers: ['normalization', '1nf', '2nf', '3nf', 'bcnf', 'acid', 'transaction', 'isolation', 'atomicity'],
    category: 'Database Management Systems',
    respond: () => ({
      text: `🛡️ **Database Normalization & ACID Transactions**\n\n` +
        `**Normalization Stages**:\n` +
        `• **1NF**: Atomic (indivisible) attribute values, no repeating groups, unique primary key.\n` +
        `• **2NF**: In 1NF + No **partial dependency** (all non-key attributes fully functionally dependent on whole composite primary key).\n` +
        `• **3NF**: In 2NF + No **transitive dependency** (no non-key attribute depends on another non-key attribute: A -> B -> C).\n` +
        `• **BCNF (Boyce-Codd)**: For every functional dependency \`X -> Y\`, \`X\` must be a super key.\n\n` +
        `**ACID Properties**:\n` +
        `• **A - Atomicity**: "All or nothing" — if any statement fails, transaction rolls back.\n` +
        `• **C - Consistency**: Database transitions from one valid state to another, satisfying constraints.\n` +
        `• **I - Isolation**: Concurrent transactions execute without interfering with each other.\n` +
        `• **D - Durability**: Once committed, changes survive system crashes or power outages.`,
      explanation: `Normalization organizes schemas to eliminate data redundancy and insertion, update, and deletion anomalies. ACID guarantees that database transactions are processed reliably and predictably under concurrent multi-user execution.`,
      codeSnippet: `-- ACID Transaction with Rollback Protection
BEGIN TRANSACTION;

UPDATE Accounts 
SET balance = balance - 500 
WHERE account_id = 'ACC_101' AND balance >= 500;

UPDATE Accounts 
SET balance = balance + 500 
WHERE account_id = 'ACC_202';

-- If balance check passes and both updates succeed:
COMMIT;
-- If any error occurred:
-- ROLLBACK;`,
      codeLanguage: 'sql',
      practiceQuestions: [
        'What is a transitive dependency and how does 3NF eliminate it?',
        'Name the four standard ANSI SQL transaction isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable).'
      ],
      recommendedTopic: 'Relational Database Concurrency & B-Tree Indexing',
      keyTakeaways: [
        'Normalization reduces redundancy; denormalization is used deliberately to optimize read throughput.',
        'ACID transactions ensure data integrity during simultaneous read/write workloads.'
      ],
      suggestedFollowUps: [
        'What is the difference between INNER JOIN and LEFT JOIN in SQL?',
        'How do B-Tree and Hash indexes speed up database lookups?'
      ]
    })
  },

  // 10. Operating Systems (Deadlocks, Processes, Threads, Scheduling)
  {
    triggers: ['operating system', 'os', 'deadlock', 'process', 'thread', 'scheduling', 'semaphore', 'mutex', 'paging', 'virtual memory'],
    category: 'Operating Systems',
    respond: () => ({
      text: `💻 **Operating Systems: Processes, Synchronization & Deadlocks**\n\n` +
        `**Process vs Thread**:\n• **Process**: Independent program with its own address space, PCB, and resources. Context switching is heavy.\n• **Thread**: Lightweight unit of execution within a process; shares code, data, and heap, but has private stack and registers.\n\n` +
        `**Deadlock (4 Coffman Conditions must hold simultaneously)**:\n` +
        `1. **Mutual Exclusion**: Non-shareable resource allocated to one process.\n` +
        `2. **Hold and Wait**: Process holding resources requests additional allocated resources.\n` +
        `3. **No Preemption**: Resources cannot be forcibly taken until released by process.\n` +
        `4. **Circular Wait**: Circular chain of processes where each waits for resource held by next.\n\n` +
        `**CPU Scheduling Algorithms**:\n• **FCFS**: First-come, first-served (susceptible to Convoy effect).\n• **SJF / SRTF**: Shortest Job First (provably optimal for minimum average waiting time).\n• **Round Robin (RR)**: Time quantum preemption; fair response time for interactive systems.`,
      explanation: `An operating system manages hardware resources and execution isolation. Deadlocks occur when 4 Coffman conditions (mutual exclusion, hold & wait, no preemption, circular wait) coincide. Synchronization primitives like mutexes and semaphores protect critical sections from race conditions.`,
      codeSnippet: `// POSIX Mutex Synchronization in C
#include <pthread.h>
#include <stdio.h>

int shared_counter = 0;
pthread_mutex_t lock;

void* increment(void* arg) {
    pthread_mutex_lock(&lock);
    // Critical Section: Protected from race conditions
    shared_counter++;
    pthread_mutex_unlock(&lock);
    return NULL;
}`,
      codeLanguage: 'c',
      practiceQuestions: [
        'How does the Banker\'s Algorithm determine if resource allocation leaves the system in a safe state?',
        'Explain the difference between Paging and Segmentation in Virtual Memory.'
      ],
      recommendedTopic: 'OS Process Synchronization & Banker\'s Deadlock Avoidance',
      keyTakeaways: [
        'Breaking any one of the 4 Coffman conditions completely prevents deadlocks.',
        'Mutex is a locking mechanism (ownership); Semaphore is a signaling mechanism (counter).'
      ],
      suggestedFollowUps: [
        'Explain Virtual Memory and LRU page replacement algorithm',
        'What is the difference between TCP and UDP in Computer Networks?'
      ]
    })
  },

  // 11. Computer Networks (OSI, TCP/IP, DNS, HTTP)
  {
    triggers: ['network', 'networking', 'osi', 'tcp', 'udp', 'dns', 'http', 'https', 'handshake', 'ip address', 'subnet'],
    category: 'Computer Networks',
    respond: () => ({
      text: `🌐 **Computer Networks: OSI Model & TCP vs UDP Architecture**\n\n` +
        `**OSI 7-Layer Model vs TCP/IP**:\n` +
        `7. **Application**: HTTP, DNS, SMTP, FTP (User interface & network services)\n` +
        `6. **Presentation**: Data formatting, encryption (TLS/SSL), compression\n` +
        `5. **Session**: Dialog control, session checkpoints\n` +
        `4. **Transport**: TCP (reliable), UDP (fast), port numbers, segment assembly\n` +
        `3. **Network**: IP addressing, routing (Routers, ICMP, packets)\n` +
        `2. **Data Link**: MAC addresses, frame framing, error detection (Switches)\n` +
        `1. **Physical**: Bits, electrical/optical signals (Cables, Hubs)\n\n` +
        `**TCP 3-Way Handshake**:\n` +
        `1. Client sends **SYN** (Synchronize sequence number)\n` +
        `2. Server responds with **SYN-ACK** (Synchronize + Acknowledge)\n` +
        `3. Client replies with **ACK** (Connection established)\n\n` +
        `**TCP vs UDP**:\n• **TCP**: Connection-oriented, ordered delivery, flow/congestion control, higher overhead.\n• **UDP**: Connectionless, best-effort delivery, no retransmissions, zero connection setup latency (DNS, VoIP, Gaming).`,
      explanation: `The OSI model standardizes network communication across 7 layers. TCP provides reliable, ordered stream delivery via a 3-way handshake and congestion control, while UDP provides fast, lightweight datagram transmission without connection overhead.`,
      codeSnippet: `// Node.js TCP Client Connection Example
import net from 'net';

const client = net.createConnection({ port: 80, host: 'example.com' }, () => {
  console.log('TCP 3-Way Handshake complete. Connected to server!');
  client.write('GET / HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n');
});

client.on('data', (data) => {
  console.log('Received payload:', data.toString().slice(0, 80));
  client.end();
});`,
      codeLanguage: 'javascript',
      practiceQuestions: [
        'How does HTTPS establish end-to-end encryption using the TLS 1.3 handshake?',
        'Calculate the number of usable host IP addresses in a /26 CIDR subnet.'
      ],
      recommendedTopic: 'Transport Layer Protocols (TCP Flow Control & Congestion Avoidance)',
      keyTakeaways: [
        'TCP guarantees delivery and order; UDP guarantees speed and minimal latency.',
        'Subnetting optimizes address space utilization and restricts broadcast domains.'
      ],
      suggestedFollowUps: [
        'How does DNS resolution resolve a domain name step-by-step?',
        'What are REST API design principles and HTTP status codes?'
      ]
    })
  },

  // 12. Web Development, React & JavaScript
  {
    triggers: ['javascript', 'js', 'react', 'hook', 'useeffect', 'usestate', 'closure', 'event loop', 'promise', 'async', 'web dev'],
    category: 'Web Development & Full Stack',
    respond: () => ({
      text: `⚛️ **Modern React & JavaScript Core Mechanics**\n\n` +
        `**JavaScript Event Loop**:\n` +
        `1. **Call Stack**: Executes synchronous code line by line.\n` +
        `2. **Web APIs / Node APIs**: Handles timers (\`setTimeout\`), fetch requests, DOM events.\n` +
        `3. **Microtask Queue**: High-priority tasks (\`Promise.then\`, \`queueMicrotask\`, \`process.nextTick\`). Executed *before* the render stage and before macrotasks.\n` +
        `4. **Macrotask Queue**: Standard timers (\`setTimeout\`, \`setInterval\`, I/O events).\n\n` +
        `**React Hooks Best Practices**:\n` +
        `• **useState**: Declares reactive local state; triggers component re-render when setter is called.\n` +
        `• **useEffect**: Handles side-effects (data fetching, subscriptions). Always specify accurate dependency arrays to prevent stale closures or infinite loops.\n` +
        `• **useMemo / useCallback**: Memoizes expensive computations and function references to optimize child re-renders.`,
      explanation: `Modern JavaScript uses an asynchronous event loop prioritizing the microtask queue over macrotasks. React uses reactive hooks and a virtual DOM reconciliation engine to update the UI efficiently based on state and prop transitions.`,
      codeSnippet: `// React Custom Hook for Debounced API Search
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup cancels pending timer if user keeps typing
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}`,
      codeLanguage: 'javascript',
      practiceQuestions: [
        'What is a closure in JavaScript and how does it retain access to its lexical outer scope?',
        'Why should you never mutate React state directly, and how does Reconciliation rely on immutability?'
      ],
      recommendedTopic: 'React Performance Optimization & State Management Architecture',
      keyTakeaways: [
        'Microtasks (Promises) drain completely before macrotasks (setTimeout) execute.',
        'React state updates are batched for performance; treat state as immutable.'
      ],
      suggestedFollowUps: [
        'Explain the difference between client-side and server-side rendering',
        'How does JWT authentication work with secure HttpOnly cookies?'
      ]
    })
  },

  // 13. Python & Object-Oriented Programming
  {
    triggers: ['python', 'oop', 'class', 'inheritance', 'polymorphism', 'encapsulation', 'abstraction', 'generator', 'decorator'],
    category: 'Programming & Languages',
    respond: () => ({
      text: `🐍 **Object-Oriented Programming (OOP) & Pythonic Paradigms**\n\n` +
        `**The 4 Pillars of OOP**:\n` +
        `1. **Encapsulation**: Bundling state (data) and behavior (methods) within classes, restricting direct access using private/protected specifiers.\n` +
        `2. **Abstraction**: Hiding internal implementation complexities and exposing only clean, high-level interfaces.\n` +
        `3. **Inheritance**: Deriving new classes from existing ones to foster code reusability and hierarchical categorization.\n` +
        `4. **Polymorphism**: Ability of different classes to respond to the same interface or method call in their own specific way (method overriding).\n\n` +
        `**Python Advanced Features**:\n` +
        `• **Decorators**: Higher-order functions that modify or extend behavior without altering source code.\n` +
        `• **Generators**: Functions using \`yield\` that produce values lazily on-demand, consuming O(1) memory for massive sequences.`,
      explanation: `Object-Oriented Programming provides structural modularity through encapsulation, abstraction, inheritance, and polymorphism. Python pairs OOP with expressive functional paradigms including decorators and memory-efficient generators.`,
      codeSnippet: `# Python Decorator and Generator Example
import time

def timing_decorator(func):
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        duration = time.perf_counter() - start
        print(f"Executed {func.__name__} in {duration:.4f}s")
        return result
    return wrapper

@timing_decorator
def fibonacci_generator(limit):
    a, b = 0, 1
    while a < limit:
        yield a
        a, b = b, a + b

# Using the generator (O(1) memory)
for num in fibonacci_generator(100):
    print(num, end=" ")`,
      codeLanguage: 'python',
      practiceQuestions: [
        'Explain the difference between method overloading and method overriding.',
        'What is Python\'s Global Interpreter Lock (GIL) and how does it affect CPU-bound multithreading?'
      ],
      recommendedTopic: 'Advanced OOP Design Patterns (Factory, Singleton, Observer)',
      keyTakeaways: [
        'Generators use `yield` to compute streams lazily with minimal memory footprint.',
        'Decorators wrap function execution cleanly for cross-cutting concerns (logging, auth, timing).'
      ],
      suggestedFollowUps: [
        'Explain Binary Search Tree deletion logic with code',
        'What is the difference between INNER JOIN and LEFT JOIN in SQL?'
      ]
    })
  }
];

/**
 * Fallback dynamic generator for arbitrary computer science questions
 */
function generateDynamicFallback(prompt, studentName, averageScore) {
  const cleanPrompt = prompt.replace(/[^\w\s]/gi, '').trim();
  const words = cleanPrompt.split(/\s+/).filter(w => w.length > 2);
  const primaryTerm = words[0] || 'your topic';

  return {
    text: `📚 **Study Breakdown for "${prompt}"**\n\n` +
      `Let's analyze this core concept step-by-step for ${studentName || 'your academic preparation'}:\n\n` +
      `1. **Conceptual Definition**: At its foundation, understanding **${primaryTerm}** requires analyzing what problem it solves, its inputs, outputs, and operational constraints.\n` +
      `2. **Core Workflow & Mechanics**: Break the problem down into independent components. Identify edge cases (empty inputs, boundaries, overflow, concurrency).\n` +
      `3. **Complexity & Efficiency**: Always benchmark the solution against standard asymptotic bounds: Time Complexity and Auxiliary Space Complexity.\n` +
      `4. **Practical Verification**: Synthesize a small reproducible working example, test it against corner cases, and explain the solution aloud to test retention.\n\n` +
      `${averageScore ? `💡 *Diagnostic Tip: Connect this concept to your ongoing syllabus review (current quiz average: ${averageScore}%).*` : ''}`,
    explanation: `For "${prompt}", start by defining the core architectural principle, evaluate boundary constraints, compare time and space trade-offs, and verify comprehension with concrete examples.`,
    codeSnippet: `// Practical template for ${primaryTerm}
function solveProblem(input) {
  // 1. Guard against edge cases
  if (!input) return null;

  // 2. Process and compute optimal solution
  const result = input;
  
  return result;
}

console.log("Verified conceptual implementation for ${primaryTerm}");`,
    codeLanguage: 'javascript',
    practiceQuestions: [
      `What are the edge cases for "${prompt}" that commonly break standard implementations?`,
      `How does the time and space complexity of "${prompt}" scale as input size increases to N = 10^6?`
    ],
    recommendedTopic: `${primaryTerm.toUpperCase()} Fundamentals & Diagnostic Practice`,
    keyTakeaways: [
      'Deconstruct complex academic problems into small, testable subcomponents.',
      'Always test edge cases and state time/space complexity explicitly in exams.'
    ],
    suggestedFollowUps: [
      'Explain Binary Search Tree deletion logic with code',
      'What is the difference between INNER JOIN and LEFT JOIN in SQL?',
      'Analyze my weak areas based on recent quiz scores'
    ]
  };
}

/**
 * Call Gemini API if configured
 */
async function callGeminiAPI(prompt, history = [], studentName, averageScore) {
  if (!GEMINI_API_KEY) return null;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const systemInstruction = `You are the official AI Study Coach & Academic Tutor for E-Study Corner, a premier computer science and engineering e-learning platform.
Student Name: ${studentName || 'Student'}
Recent Quiz Average: ${averageScore !== null ? `${averageScore}%` : 'No attempts yet'}

Respond as an encouraging, rigorous university tutor. You MUST return your response as a valid JSON object matching this exact schema:
{
  "text": "Comprehensive conversational markdown response with clear headings, bullet points, and explanations",
  "explanation": "Concise 2-3 sentence conceptual explanation summary",
  "codeSnippet": "Clean, syntactically correct code snippet if applicable (otherwise empty string)",
  "codeLanguage": "cpp|python|javascript|sql|c|java|text",
  "practiceQuestions": ["Question 1", "Question 2"],
  "recommendedTopic": "Topic Name",
  "keyTakeaways": ["Key takeaway 1", "Key takeaway 2"],
  "suggestedFollowUps": ["Suggested question 1", "Suggested question 2"]
}`;

  const contents = [];
  if (Array.isArray(history) && history.length > 0) {
    for (const msg of history.slice(-6)) {
      contents.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text || msg.explanation || '' }]
      });
    }
  }
  contents.push({ role: 'user', parts: [{ text: prompt }] });

  const payload = {
    contents,
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1500,
      responseMimeType: 'application/json'
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    const parsed = JSON.parse(candidateText);
    if (parsed && typeof parsed.explanation === 'string' && Array.isArray(parsed.practiceQuestions)) {
      return parsed;
    }
    return null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * Main AI Coach Response Dispatcher
 */
export async function generateAICoachResponse({
  prompt,
  history = [],
  studentName = 'Student',
  studentId,
  attempts = []
}) {
  const queryLower = prompt.trim().toLowerCase();

  // Calculate student average score if attempts are available
  const recentAttempts = (attempts || []).slice(0, 5);
  const averageScore = recentAttempts.length > 0
    ? Math.round(recentAttempts.reduce((sum, att) => sum + (att.percentage || 0), 0) / recentAttempts.length)
    : null;

  // 1. If Gemini API key is available, attempt cloud response
  try {
    const cloudResponse = await callGeminiAPI(prompt, history, studentName, averageScore);
    if (cloudResponse) {
      return cloudResponse;
    }
  } catch (err) {
    console.warn('[aiCoachEngine] Cloud LLM error, falling back to built-in knowledge base:', err.message);
  }

  // 2. Exact match search in Knowledge Base
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.exactMatches && entry.exactMatches.includes(queryLower)) {
      return entry.respond({ studentName, attempts, averageScore, prompt });
    }
  }

  // 3. Keyword / Trigger based matching in Knowledge Base
  for (const entry of KNOWLEDGE_BASE) {
    const matchesTrigger = entry.triggers.some(trigger => queryLower.includes(trigger));
    if (matchesTrigger) {
      return entry.respond({ studentName, attempts, averageScore, prompt });
    }
  }

  // 4. Dynamic academic response generator fallback
  return generateDynamicFallback(prompt, studentName, averageScore);
}
