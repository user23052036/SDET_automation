# 1. 🔥 Questions they are most likely to ask about YOUR project

These are the questions I would put at the top of your study list.

## A. Project understanding

### 1. Tell me about your project.

**Interview answer:**

> My project is a sentiment-analysis system for tweets. I used Python to build an NLP preprocessing and machine-learning pipeline. First, I loaded and cleaned the tweet dataset, then tokenized the text and removed common stopwords while preserving important negation words such as "not", "never", and "can't". After that, I performed a stratified 80-20 train-test split, converted the text into TF-IDF features using unigrams and bigrams, trained a Logistic Regression classifier with balanced class weights, and evaluated it using accuracy, precision, recall, F1-score, and a confusion matrix. Finally, I persisted both the trained model and TF-IDF vectorizer using joblib.     

---

### 2. What exactly are you testing in this project?

This is a **very important SDET question**.

A strong answer:

> I would test the pipeline at multiple levels. I would unit-test individual preprocessing functions such as tweet cleaning and tokenization, integration-test the preprocessing-to-vectorization-to-model pipeline, validate model outputs using a fixed test dataset, and perform data-quality and edge-case testing. I would also test the persisted model and vectorizer after loading them to ensure they produce consistent predictions.

---

### 3. What are the components of your system?

You should be able to draw this:

```text
Raw CSV
   ↓
Data Loading
   ↓
Label Mapping
   ↓
Tweet Cleaning
   ↓
Tokenization
   ↓
Stopword Removal
   ↓
Train/Test Split
   ↓
TF-IDF Vectorization
   ↓
Logistic Regression
   ↓
Prediction
   ↓
Evaluation
   ↓
Model + Vectorizer Persistence
```

The notebook follows essentially this sequence.     

---

# 2. 🔥 Code-specific testing questions

These are where I expect the interviewer to probe you.

## Data loading

### 4. How would you test that the CSV was loaded correctly?

You should mention:

* File exists
* File is readable
* Expected number of columns
* Expected column names
* No unexpected missing values
* Correct encoding
* Correct data types
* Valid label values
* Duplicate records
* Empty tweets

Your code manually defines six columns and reads the dataset with `header=None` and `latin-1`. 

---

### 5. Why did you use `header=None`?

Because the source CSV does not contain a header row, and you explicitly provide column names using `names=columns`.

Follow-up:

> What happens if the CSV actually contains a header?

Your first data row may be interpreted incorrectly as data.

---

### 6. Why did you use Latin-1 instead of UTF-8?

This is a **dangerous question for you** because your own comment says Latin-1 cannot properly represent emojis, Hindi, Arabic, Chinese, etc. 

A good answer:

> The dataset was loaded successfully using Latin-1, but UTF-8 would generally be preferable for modern social-media text because tweets can contain Unicode characters. I would validate the actual dataset encoding rather than blindly choosing one.

This answer is much safer than claiming Latin-1 is superior.

---

# 3. 🔥 Label validation

Your code converts:

```python
0 -> 0
4 -> 1
```

using:

```python
y = y.map({0: 0, 4: 1})
```



### 7. What would you test after label mapping?

Check:

```python
y.isna().sum()
y.unique()
y.value_counts()
```

because any unexpected original label becomes `NaN`.

### Interview question:

> What happens if the dataset contains label `2`?

Answer:

> `map()` would produce `NaN` for that value, so I should explicitly validate the allowed labels before training.

That is a very good testing answer.

---

# 4. 🔥 Testing `clean_tweet()`

Your function is:

```python
def clean_tweet(text):
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"[^a-z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text
```



An interviewer can generate **a huge number of test cases** from this alone.

### 8. What test cases would you write for `clean_tweet()`?

| Input                           | Expected behavior    |
| ------------------------------- | -------------------- |
| `"HELLO"`                       | `"hello"`            |
| `"Hello   World"`               | `"hello world"`      |
| `"hello\nworld"`                | `"hello world"`      |
| `"visit http://abc.com"`        | URL removed          |
| `"@john hello"`                 | mention removed      |
| `"Hello!!!"`                    | punctuation removed  |
| `"hello123"`                    | digits removed       |
| `""`                            | empty output         |
| `"   "`                         | empty output         |
| `"HELLO!!! @user http://x.com"` | cleaned text         |
| `"I can't"`                     | becomes `"i cant"`   |
| `"I'm happy"`                   | becomes `"im happy"` |

And here is the **important problem**:

### 9. What is potentially wrong with this preprocessing?

Your regex:

```python
r"[^a-z\s]"
```

removes everything except ASCII letters and whitespace. 

So:

```text
"I’m happy 😊"
```

loses punctuation/Unicode.

Also:

```text
"can't"
```

becomes:

```text
"cant"
```

Your later negation list explicitly contains `"cant"`, so you attempted to compensate for this. 

A tough interviewer may ask:

> What about "can't" versus "cant"? Are they always equivalent?

You should say:

> Not necessarily. My preprocessing normalizes them into the same token, which can lose information. A production-quality preprocessing strategy should deliberately decide how contractions and negations are represented rather than accidentally destroying that information.

That's a strong answer.

---

# 5. 🔥 Tokenization testing

You use NLTK `word_tokenize`. 

### 10. What is tokenization?

Breaking text into smaller units, usually words/tokens.

### 11. How would you test tokenization?

Test:

* Empty string
* One word
* Multiple words
* Multiple spaces
* punctuation
* numbers
* contractions
* special characters
* Unicode
* very long input

### 12. Why not simply use `split()`?

Your notebook actually demonstrates the distinction between:

```python
text.split(' ')
```

and:

```python
word_tokenize(text)
```

The examples show that `word_tokenize()` handles punctuation differently. 

This is an excellent interviewer question:

> Why did you use NLTK tokenization instead of `split()`?

---

# 6. 🔥 Stopword testing

You intentionally remove stopwords but preserve negations:

```python
stop_words = set(stopwords.words("english")) - negation_words
```



### 13. Why did you exclude negation words from stopword removal?

Because:

```text
"I am happy"
```

and

```text
"I am not happy"
```

have completely different sentiment.

If `"not"` is removed, the model could receive effectively:

```text
happy
```

instead of:

```text
not happy
```

This is a **very likely project question**.

---

### 14. What edge cases would you test?

Examples:

```text
not good
never good
no problem
can't wait
isn't happy
don't like this
```

Also test:

```text
NOT GOOD
Not good
not     good
not-good
```

because preprocessing determines whether these are represented consistently.

---

# 7. 🔥 Class imbalance

Your dataset contains:

* class 0: 799,996
* class 1: 248,576

and your training distribution is roughly:

* class 0: 76.29%
* class 1: 23.71%  

### 15. What is class imbalance?

One class has significantly more samples than another.

### 16. Why is class imbalance a problem?

Because a classifier can appear accurate while performing poorly on the minority class.

### 17. How did you address it?

You used:

```python
LogisticRegression(
    max_iter=2000,
    class_weight="balanced"
)
```



### 18. What does `class_weight="balanced"` do?

It increases the importance of underrepresented classes during training.

### 19. Why didn't you rely only on accuracy?

Because accuracy can hide poor minority-class performance.

This is especially important in your project because your class distribution is substantially imbalanced.

---

# 8. 🔥 Train/test split

You use:

```python
test_size=0.2
random_state=77
stratify=y
```



### 20. Why 80/20?

You can say:

> I used 80% for training and 20% for testing as a conventional holdout split, while ensuring the test set is large enough for reliable evaluation.

Don't pretend 80/20 is a universal rule.

---

### 21. Why `random_state=77`?

For reproducibility.

---

### 22. Why `stratify=y`?

To preserve approximately the same class distribution in training and testing.

This is particularly relevant here because the dataset is imbalanced.

---

### 23. What happens if you don't use stratification?

The class distribution could differ between train and test, potentially making evaluation less representative.

---

# 9. 🔥 TF-IDF questions

Your configuration is:

```python
TfidfVectorizer(
    max_features=30000,
    ngram_range=(1, 2),
    min_df=3,
    sublinear_tf=True
)
```



Expect questions on **every single parameter**.

### 24. What is TF-IDF?

### 25. Why use TF-IDF instead of raw word counts?

### 26. What does `max_features=30000` mean?

### 27. Why did you select 30,000?

### 28. What does `ngram_range=(1,2)` mean?

It means:

```text
unigrams + bigrams
```

For:

```text
"I love this movie"
```

unigrams:

```text
I
love
this
movie
```

bigrams:

```text
I love
love this
this movie
```

---

### 29. Why are bigrams useful for sentiment?

Because phrases such as:

```text
not good
very bad
love this
```

carry meaning that individual words may not capture.

---

### 30. What does `min_df=3` mean?

Ignore terms appearing in fewer than three documents.

---

### 31. What does `sublinear_tf=True` mean?

Term frequency is transformed using logarithmic scaling rather than raw frequency.

You should understand this, not memorize the variable name.

---

# 10. 🔥 Data leakage — VERY IMPORTANT

Your code correctly does:

```python
vectorizer.fit(X_train)
X_train_tfidf = vectorizer.transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)
```



### 32. Why do you `fit()` TF-IDF only on training data?

Because fitting the vectorizer on the entire dataset before splitting would allow information from the test set to influence feature construction.

That is a form of **data leakage**.

### 33. What is data leakage?

When information from outside the training data improperly influences model training.

### 34. What would be wrong?

```python
vectorizer.fit(X)
X_train, X_test = train_test_split(X)
```

because the vectorizer has already seen the entire dataset.

This is a **must-know SDET/ML testing question** for this project.

---

# 11. 🔥 Sparse matrix questions

Your TF-IDF result is a CSR sparse matrix, with only around **0.0277% non-zero entries**. 

### 35. Why is TF-IDF represented as a sparse matrix?

Because most word/document combinations have zero values.

### 36. Why is sparse representation useful?

It saves memory and computation compared with storing the complete dense matrix.

### 37. What happens if you convert this to a dense matrix?

Potentially enormous memory consumption and possibly an out-of-memory failure.

This could become a strong SDET edge-case question:

> How would you test the application with a very large dataset?

---

# 12. 🔥 Logistic Regression

### 38. Why did you select Logistic Regression?

A good answer:

> For high-dimensional sparse text features such as TF-IDF, linear classifiers such as Logistic Regression are strong baselines. It is relatively simple, efficient, interpretable compared with more complex models, and works well with sparse feature matrices.

---

### 39. Why `max_iter=2000`?

Because iterative optimization may require more iterations to converge with a large, high-dimensional feature space.

### 40. What happens if the model does not converge?

You may receive a convergence warning and the learned solution may be unreliable.

Testing should therefore include checking for warnings/convergence rather than only checking whether execution completed.

---

# 13. 🔥 Model persistence

You save:

```text
tfidf_vectorizer.joblib
logistic_regression.joblib
```

using `joblib.dump()`. 

### 41. Why save the vectorizer as well as the model?

This is a **very important question**.

Because the model expects the exact same feature representation used during training.

You cannot simply load the Logistic Regression model and send raw text to it.

The production flow is:

```text
raw tweet
 ↓
same preprocessing
 ↓
same fitted TF-IDF vectorizer
 ↓
feature vector
 ↓
trained model
 ↓
prediction
```

---

### 42. What would happen if you retrained the vectorizer separately during prediction?

The feature-to-index mapping could differ from what the model was trained on, making predictions invalid or incorrect.

---

# 14. 🔥 Evaluation questions

Your test results are:

```text
Accuracy = 0.7964
```

and the classification report shows materially different performance between classes. 

### 43. Is 79.64% accuracy good?

**Do not answer simply "yes."**

Say:

> It depends on the business requirement and baseline. Because the dataset is imbalanced, I would not judge the model from accuracy alone. I would examine precision, recall, F1-score and class-specific performance.

That is much stronger.

---

### 44. Which metric would you prioritize?

Depends on the business problem.

For example:

If missing positive sentiment is costly → prioritize recall for positive class.

If false positives are costly → prioritize precision.

If you need balance → F1-score.

---

### 45. What is precision?

$$
Precision = \frac{TP}{TP+FP}
$$

### 46. What is recall?

$$
Recall = \frac{TP}{TP+FN}
$$

### 47. What is F1-score?

$$
F1 = 2 \times \frac{Precision \times Recall}{Precision + Recall}
$$

---

# 15. 🔥 Confusion matrix questions

Your confusion matrix is:

```text
[[124243, 35757],
 [  9967, 39748]]
```



### 48. Explain this confusion matrix.

Assuming rows are actual and columns are predicted:

```text
                 Predicted
                 0       1

Actual 0       124243  35757
Actual 1         9967  39748
```

Therefore:

```text
TN = 124243
FP = 35757
FN = 9967
TP = 39748
```

### 49. Which error is more common?

False positives:

```text
35,757
```

versus false negatives:

```text
9,967
```

So the model is considerably more likely to classify a negative tweet as positive than the reverse.

That's exactly the kind of observation an interviewer may expect.

---

# 16. 🔥 Actual SDET testing questions for THIS project

Now we're getting to what you originally asked for.

### 50. How would you unit-test `clean_tweet()`?

Use parameterized tests.

For example conceptually:

```python
@pytest.mark.parametrize(...)
def test_clean_tweet(input_text, expected):
    assert clean_tweet(input_text) == expected
```

---

### 51. What positive test cases would you create?

Examples:

* Normal English sentence
* Sentence containing URL
* Sentence containing username
* Sentence containing punctuation
* Uppercase sentence
* Multiple spaces
* Sentence containing negation
* Mixed valid text

---

### 52. What negative test cases?

* `None`
* Integer instead of string
* Empty string
* whitespace-only string
* extremely long string
* malformed Unicode
* unexpected object type

Your current function assumes `text` behaves like a string. That means `None` would fail.

That's exactly the sort of robustness gap worth identifying.

---

### 53. What boundary-value tests would you create?

* Empty string
* 1-character string
* Maximum expected tweet length
* Extremely long text
* one token
* zero tokens after preprocessing
* minimum/maximum dataset size

---

### 54. How would you test a tweet that becomes empty after preprocessing?

For example:

```text
"!!! @john http://abc.com"
```

Potential result:

```text
""
```

You need to decide what your system should do with it.

This is a genuine unresolved edge case in your notebook.

---

# 17. 🔥 Pipeline integration testing

An interviewer may ask:

> How would you test the complete ML pipeline?

Your answer:

```text
CSV
 ↓
validation
 ↓
cleaning
 ↓
tokenization
 ↓
stopword removal
 ↓
TF-IDF
 ↓
model
 ↓
prediction
```

Test that:

1. Input is accepted.
2. Cleaning produces expected output.
3. Tokens are generated.
4. Vectorizer accepts the processed text.
5. Matrix dimensions are correct.
6. Model accepts the matrix.
7. Prediction count equals input count.
8. Predictions contain only valid labels.
9. Evaluation metrics can be calculated.

---

# 18. 🔥 Regression testing

### 55. How would you know that a code change hasn't broken your model?

Create a fixed regression dataset.

For example:

```text
Input tweet              Expected
"I love this"            1
"I hate this"            0
"not good"               0
"excellent product"      1
```

After every code change:

```text
preprocessing changes
        ↓
run regression suite
        ↓
compare predictions
        ↓
compare metrics
```

This is exactly where SDET thinking should enter an ML project.

---

# 19. 🔥 Flaky test questions

### 56. What is a flaky test?

A test that sometimes passes and sometimes fails without a relevant code change.

### 57. Can ML tests be flaky?

Yes.

Potential causes include:

* Random train/test split
* nondeterministic algorithms
* dependency/version changes
* data changes
* floating-point differences
* environment differences

You already use:

```python
random_state=77
```

which improves reproducibility. 

---

# 20. 🔥 How would you automate this as an SDET?

This is probably the **single most important question to prepare** given the job title.

Your notebook should ideally be converted into something like:

```text
sentiment_project/
│
├── src/
│   ├── preprocessing.py
│   ├── vectorizer.py
│   ├── model.py
│   └── prediction.py
│
├── tests/
│   ├── test_preprocessing.py
│   ├── test_data_validation.py
│   ├── test_vectorizer.py
│   ├── test_model.py
│   └── test_prediction.py
│
├── models/
├── data/
├── requirements.txt
├── pytest.ini
└── README.md
```

Then use **pytest** to automate the test suite.

This is a much stronger SDET story than saying "I ran the cells in Jupyter and checked the accuracy."

---

# 21. Very likely generic SDET questions

Even though they may start with this project, I would expect them to move into these.

### Testing fundamentals

1. What is software testing?
2. Why do we test?
3. Verification vs validation?
4. Test scenario vs test case?
5. Smoke vs sanity?
6. Regression vs retesting?
7. Functional vs non-functional?
8. Black-box vs white-box?
9. Severity vs priority?
10. Positive vs negative testing?
11. Boundary value analysis?
12. Equivalence partitioning?
13. Exploratory testing?
14. Regression testing?
15. End-to-end testing?
16. Integration testing?
17. System testing?
18. Unit testing?
19. Acceptance testing?
20. What is a defect life cycle?

---

# 22. Very likely Python questions

For an SDET role:

1. List vs tuple
2. Set vs dictionary
3. Mutable vs immutable
4. `==` vs `is`
5. `*args` and `**kwargs`
6. Exception handling
7. `try/except/finally`
8. Classes and objects
9. Inheritance
10. Encapsulation
11. Polymorphism
12. Abstract classes
13. Decorators
14. Lambda
15. List comprehensions
16. Generators
17. Iterators
18. `map()`
19. `filter()`
20. `reduce()`
21. File handling
22. JSON
23. CSV
24. `pytest`
25. fixtures
26. parameterization
27. mocking

---

# 23. Very likely automation questions

Even though they're not present in this notebook, an SDET interviewer can still ask:

### Selenium

* What is Selenium?
* WebDriver?
* `find_element()`?
* XPath?
* CSS selector?
* Explicit wait?
* Implicit wait?
* Fluent wait?
* `time.sleep()` vs explicit wait?
* StaleElementReferenceException?
* NoSuchElementException?
* ElementNotInteractableException?
* Frames?
* Alerts?
* Multiple windows?
* Dropdown?
* Actions class?
* JavaScriptExecutor?
* Screenshots?

### Framework

* Page Object Model?
* Page Factory?
* Fixtures?
* Test setup/teardown?
* Parallel execution?
* Data-driven testing?
* Configuration management?
* Logging?
* Reporting?
* Retry mechanism?
* CI/CD?

---

# 24. Questions specifically designed to catch bluffing

Prepare these very seriously.

### 58. Why did you choose Logistic Regression instead of SVM?

### 59. Why didn't you use Naive Bayes?

### 60. Why TF-IDF instead of Word2Vec?

### 61. Why didn't you use an LSTM?

### 62. Why didn't you use BERT?

### 63. What would you change to improve the model?

### 64. What are the limitations of your preprocessing?

### 65. What happens to emojis?

### 66. What happens to sarcasm?

### 67. What happens to negation?

### 68. What happens to multilingual tweets?

### 69. What happens if a completely unseen word appears during prediction?

### 70. What happens if the model file is corrupted?

### 71. How would you validate the saved `.joblib` files?

### 72. How would you test model compatibility across Python/scikit-learn versions?

### 73. How would you test the model after deployment?

### 74. How would you monitor model degradation?

### 75. How would you detect data drift?

These are the questions that separate someone who **used libraries** from someone who understands the system.

---

# 25. Problems in your current project an interviewer may notice

I'm going to be blunt here because these are exactly the areas I'd fix before the interview.

### Problem 1 — It is a notebook, not an automation framework

There is no actual automated testing framework shown.

### Problem 2 — Hard-coded Windows path

You have:

```python
MODEL_DIR = Path(r"C:/Users/user23052036/Desktop/sentiment_analysis")
```



That's not portable.

A better framework would use configuration/environment variables.

---

### Problem 3 — Preprocessing can destroy information

```python
r"[^a-z\s]"
```

removes Unicode, digits, punctuation, emojis, etc. 

That might be acceptable for a simplified experiment, but you should acknowledge the tradeoff.

---

### Problem 4 — No explicit input validation

For example:

```python
clean_tweet(None)
```

would fail.

A production-grade component should define expected input types and behavior for invalid input.

---

### Problem 5 — No automated threshold/gating

You calculate accuracy and classification metrics, but there is no test such as:

```python
assert accuracy >= required_threshold
```

So the pipeline can execute successfully even if model quality deteriorates badly.

This is a major SDET opportunity.

---

### Problem 6 — No automated regression suite

You manually inspect outputs.

An SDET should convert those checks into repeatable automated tests.

---

### Problem 7 — No CI/CD shown

A strong answer to:

> How would you improve this?

is:

> I would extract the notebook into Python modules, create pytest-based unit and integration tests, add deterministic regression datasets, introduce quality gates for model metrics, and execute the suite through CI/CD.

---

# Your highest-priority study order

For **tomorrow's interview**, I would not try to memorize all 75 questions equally.

Study in this order:

**Priority 1**

Your project explanation → data cleaning → tokenization → stopwords → negation → train/test split → stratification → TF-IDF → Logistic Regression → class imbalance → precision/recall/F1 → confusion matrix.

**Priority 2**

How to **test this project**:

```text
unit testing
integration testing
data validation
edge cases
negative testing
regression testing
model validation
reproducibility
```

**Priority 3**

Pytest + Python automation fundamentals.

**Priority 4**

Selenium/Web automation fundamentals, even though they are not present in this notebook.

---

And there is one question I strongly expect:

> **"You are applying for an SDET role. Where exactly is the automation in this project?"**

You should **not** try to bluff.

The correct framing is:

> "The current version is primarily the ML pipeline. My automation contribution would be to convert the pipeline into testable Python modules and build a pytest automation suite around preprocessing, data validation, model inference, persistence, regression cases, and model-quality checks."

That answer is honest and turns the weakness into an SDET discussion.

The next useful step is to turn this into a **mock interview based specifically on this notebook**, where I ask you the questions one at a time, including follow-up questions intended to catch weak answers.
