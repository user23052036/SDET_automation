# Part 1 — Forget testing theory for a moment

Imagine I am your interviewer.

You finish your introduction.

I look at your resume and say:

> **"You have a Credit Card Fraud Detection project. How would you test this project?"**

You currently have no structured answer.

That's what we're going to fix.

---

# Part 2 — First understand what you actually built

Your project is essentially:

```text
Credit Card Transaction
        ↓
Input data
        ↓
Preprocessing
        ↓
ML model
        ↓
Fraud probability
        ↓
Decision threshold
        ↓
Fraud / Legitimate
```

Your actual notebook uses:

```text
284,807 transactions
492 fraud
0 = legitimate
1 = fraud
```

with an extremely imbalanced fraud rate of about 0.172%. The dataset contains V1–V28 PCA-transformed features plus `Time` and `Amount`. 

You then:

```text
Train/test split
       ↓
StandardScaler on Time/Amount
       ↓
Logistic Regression
Random Forest
XGBoost
       ↓
SMOTE versions
       ↓
Cost-sensitive XGBoost
       ↓
predict_proba()
       ↓
threshold = 0.25
       ↓
Fraud / Legitimate
```

The final XGBoost is configured with `scale_pos_weight`, 500 estimators, learning rate 0.05 and max depth 6. 

The notebook then takes the fraud probability and applies a threshold of 0.25 rather than the default 0.5. 

So now we have something concrete to test.

---

# Part 3 — What does "testing your project" actually mean?

Here's the key idea.

You're **not only testing whether the ML model gives correct predictions**.

You're testing whether the **whole system behaves correctly**.

Break your project into layers.

```text
             FRAUD DETECTION SYSTEM
                      │
       ┌──────────────┼──────────────┐
       ↓              ↓              ↓
     Input       Processing        Output
       │              │              │
    validity       scaling        probability
    missing data   model          threshold
    duplicates     prediction     final label
    bad values                    fraud/legit
```

Now we can generate test cases naturally.

---

# Part 4 — Layer 1: Test the input

Suppose one transaction is:

```text
Time = 50000
Amount = 250
V1 = ...
V2 = ...
...
V28 = ...
```

Before worrying about XGBoost, ask:

> Is this input valid?

That's testing.

### Test case 1 — normal transaction

Everything is present and valid.

Expected:

> System accepts the transaction and produces a prediction.

### Test case 2 — missing value

Suppose:

```text
Amount = NULL
```

Question:

> What should happen?

Your system currently doesn't have an explicit input-validation layer. That's important.

A good testing answer is:

> "I would test missing values in required features and verify that the system rejects the transaction with a meaningful validation error rather than producing an unreliable prediction."

You do **not** have to claim your notebook currently handles this.

In fact, don't.

Say:

> "My current notebook assumes the input has the expected schema, but in a production system I would add input validation."

That's honest and technically stronger.

---

# Part 5 — Negative testing becomes extremely obvious

Suppose `Amount` should normally be non-negative.

Try:

```text
Amount = -100
```

What happens?

That's a negative test.

Try:

```text
Amount = 0
```

That's another edge case.

Try:

```text
Amount = 1,000,000
```

That's an extreme value / distribution-shift test.

Try:

```text
Amount = "hello"
```

That's invalid datatype testing.

So your interviewer asks:

> **"How would you test edge cases in your fraud project?"**

You can say:

> "I would divide the test cases into valid inputs, invalid inputs and boundary or extreme inputs. For example, I would test missing features, incorrect data types, zero or negative transaction amounts, extremely large amounts, duplicate transactions and malformed records. I would verify that invalid inputs are rejected appropriately and valid inputs produce a prediction."

That's already much better than your Round 1 answer.

---

# Part 6 — Now test the preprocessing

Your notebook applies `StandardScaler` to `Time` and `Amount`.

More importantly, you correctly fit the scaler on training data and transform the test data using the same fitted scaler. 

That gives us testing opportunities.

### Test:

> Did the scaler use only training data?

You can verify:

```text
fit → X_train
transform → X_test
```

and not:

```text
fit → X_test
```

Why?

Because fitting on test data introduces leakage.

This gives you a very nice interview answer:

> "For preprocessing, I would verify that the scaler is fitted only on training data and that the same fitted scaler is used during testing and inference. I would also test that missing or invalid values are handled before scaling."

---

# Part 7 — Now test the model itself

Suppose the model returns:

```text
P(fraud) = 0.83
```

Fine.

But now:

```text
P(fraud) = 0.51
```

What happens?

Now:

```text
P(fraud) = 0.249
```

What happens?

Now:

```text
P(fraud) = 0.250
```

This is extremely important because **your project explicitly uses a threshold of 0.25**. 

So test the boundary:

```text
0.249
0.250
0.251
```

And ask whether the system behaves according to the defined rule.

This is **boundary-value thinking**.

---

# Part 8 — This is the exact connection between general testing and your ML project

You learned earlier:

> Boundary Value Analysis.

Now don't memorize it.

Look at your project:

```text
threshold = 0.25
```

Therefore test:

```text
0.24
0.249
0.25
0.251
0.26
```

You're testing around the boundary.

That's the concept.

---

# Part 9 — Test the output

Your output isn't simply "0 or 1".

Your model first gives:

```text
probability
```

then:

```text
threshold
```

then:

```text
final class
```

So test all three.

For example:

```text
Probability = 0.80
Expected label = Fraud
```

and:

```text
Probability = 0.10
Expected label = Legitimate
```

Then test the boundary.

This is especially useful because your notebook uses `predict_proba()` for threshold tuning. Your project Q&A explains that `predict_proba()[:,1]` gives the fraud probability used for threshold tuning and the PR curve. 

---

# Part 10 — Test the model's business behaviour

This is where your project becomes more interesting than a normal classification problem.

Suppose:

```text
Actual = Fraud
Predicted = Legitimate
```

That's:

> **False Negative**

That's extremely dangerous.

Because a fraud slipped through.

Now:

```text
Actual = Legitimate
Predicted = Fraud
```

That's:

> **False Positive**

This causes investigation/customer inconvenience.

Your project's own analysis recognizes that missed fraud has a higher practical cost than flagging a legitimate transaction. 

Therefore a testing question could be:

> "What would you prioritize, false positives or false negatives?"

Your answer:

> "For this application, false negatives are generally more costly because an actual fraudulent transaction may go undetected. But I would not try to reduce false negatives to zero without considering false positives, because flagging too many legitimate transactions would create a large investigation burden. The threshold should be selected based on the business cost tradeoff."

That's excellent interview reasoning.

---

# Part 11 — Now let's test the imbalance problem

Your dataset has:

```text
284,315 legitimate
492 fraud
```

approximately.

So an absurd model could do:

```text
Predict everything = legitimate
```

and obtain around:

```text
99.83% accuracy
```

while detecting:

```text
0 fraud
```

Your project documentation explicitly discusses this problem. 

So the interviewer could ask:

> "Suppose your fraud model has 99.8% accuracy. Is that good?"

Your answer should immediately be:

> "Not necessarily. Because the dataset is extremely imbalanced, a model that predicts every transaction as legitimate can achieve about 99.83% accuracy while detecting zero fraud. So I would focus on fraud recall, precision and PR-AUC rather than accuracy alone."

That should become automatic.

---

# Part 12 — Now we get into actual SDET-style testing

Suppose I ask:

> **"How would you test the SMOTE implementation?"**

Don't panic.

We know what SMOTE is.

It generates synthetic minority samples.

So ask:

### Test 1

Before SMOTE:

```text
minority << majority
```

After SMOTE:

```text
minority increased
```

### Test 2

Check:

> Was SMOTE applied only to training data?

Your notebook does this:

```text
X_train, Y_train
        ↓
SMOTE
        ↓
X_train_sm, Y_train_sm
```

The test set remains untouched. 

### Test 3

Check that:

> Test data still represents the original real-world distribution.

### Test 4

Check that:

> No target labels accidentally get passed as features.

This is testing the implementation, not just the ML concept.

---

# Part 13 — And here's a very important one: test whether your comparison is actually valid

Your notebook contains a real bug.

The SMOTE Logistic Regression and SMOTE Random Forest are trained, but their evaluation cells accidentally call the **original baseline models** instead of the SMOTE models. Your project document explicitly identifies this. 

Conceptually:

```python
# wrong
log_model.predict(X_test)

# should be
log_model_sm.predict(X_test)
```

That's a fantastic interviewer question.

They may ask:

> "How would you test whether your ML pipeline is correctly evaluating the model?"

You could say:

> "I would verify that the model object used for training is the same model object used for evaluation. In my notebook I actually found one issue here: the SMOTE Logistic Regression and Random Forest evaluation cells were accidentally using the baseline model variables instead of the SMOTE-trained variables. That would make the comparison invalid."

That answer demonstrates something **much stronger than memorized testing theory**.

It demonstrates:

> **You can inspect code and detect a defect.**

That's exactly the mindset they want from an SDET.

---

# Part 14 — Test reproducibility

Your project uses:

```text
random_state = 42
```

for reproducibility. Your Q&A documentation confirms this. 

So testing could include:

> Run the same pipeline twice with the same data and seed.

Expected:

> Same train/test split and reproducible results.

This is a legitimate test case.

---

# Part 15 — Test model persistence

Your project saves the trained model and scaler using `joblib`. 

So imagine:

```text
Train model
    ↓
Save model
    ↓
Load model
    ↓
Predict same transaction
```

You should expect:

> Same prediction.

That is another very concrete test.

You can say:

> "I would also test model serialization by comparing predictions before and after saving and loading the model. They should remain consistent for the same input."

That's an excellent answer.

---

# Part 16 — Test schema

Your model expects a specific set of features.

Imagine production sends:

```text
V1
V2
...
V27
Amount
```

but `V28` is missing.

What happens?

That's a schema validation test.

You can test:

```text
Correct number of features
Missing feature
Extra feature
Wrong column name
Wrong datatype
Wrong column order if applicable
```

This is a very natural SDET question.

---

# Part 17 — Test data distribution

Suppose training data had:

```text
Amount max ≈ 25,000
```

and production suddenly sends:

```text
Amount = 1,000,000
```

That's not simply an ordinary invalid input.

That's a **distribution shift / outlier**.

Your project Q&A specifically identifies this kind of conceptual follow-up. 

A good answer:

> "I would test extreme values that are far outside the training distribution. If the model receives such inputs, I would check whether the system rejects them, handles them safely, or produces unreliable predictions. In production I would add validation and monitoring for such distribution shifts."

Notice what we're doing.

We're **not memorizing "distribution shift"**.

We're asking:

> "What happens when reality gives me something the training data never saw?"

---

# Part 18 — Your interviewer might ask: "Give me edge cases"

Here is your answer structure.

For this project, think in **seven buckets**:

```text
1. Input
2. Preprocessing
3. Model
4. Threshold
5. Output
6. Performance
7. Failure/recovery
```

Let's make it concrete.

### Input

```text
missing value
invalid datatype
negative amount
zero amount
extreme amount
duplicate transaction
missing feature
extra feature
```

### Preprocessing

```text
wrong scaler
scaler fitted on test data
inconsistent preprocessing
```

### Model

```text
model file missing
corrupted model
unexpected input shape
unseen distribution
```

### Threshold

```text
0.249
0.250
0.251
```

### Output

```text
probability outside [0,1]
incorrect label mapping
wrong fraud/legitimate conversion
```

### Performance

```text
1 transaction
1,000 transactions
100,000 transactions
```

### Failure

```text
model unavailable
invalid input
file unavailable
database/API failure if deployed
```

That is the framework I want burned into your head.

---

# Part 19 — Here's an interview answer you should learn conceptually

Not word-for-word, but understand the structure:

> **"For my fraud detection system, I would test it at multiple levels. First, I'd validate the input data — missing values, invalid types, negative or extreme transaction amounts, missing or extra features and duplicate transactions. Then I'd verify preprocessing, especially that the scaler is fitted only on training data and reused consistently during inference. For the model, I'd test normal and unusual transactions and verify that the predicted probability and final fraud label behave correctly. Since I use a threshold of 0.25, I'd specifically test values around that boundary. Finally, I'd test the business behaviour using false positives and false negatives, because missing fraud is more costly than incorrectly flagging some legitimate transactions. I'd also test model loading, reproducibility and larger batches to check reliability and performance."**

That is a **real SDET answer**.

And notice something important:

You didn't need to memorize:

> "Boundary Value Analysis is..."

You simply used boundary testing naturally.

---

# Part 20 — Now let's attack your project like an interviewer

There are about 15 questions I would expect you to be able to handle.

### Very likely

**1. How would you test your fraud detection system?**

**2. What edge cases would you consider?**

**3. What happens if Amount is negative?**

**4. What happens if some input features are missing?**

**5. How would you test the threshold?**

**6. Why is accuracy not sufficient?**

**7. What would you do about false positives and false negatives?**

**8. How would you test SMOTE?**

**9. How would you verify that your model is being evaluated correctly?**

**10. How would you test saved/loading models?**

### More probing

**11. What if a completely new fraud pattern appears?**

**12. What if production data has an amount much larger than anything in training?**

**13. What if the model file becomes corrupted?**

**14. How would you test performance with a million transactions?**

**15. What if the same transaction is sent twice?**

The interesting part is that almost all of these can be answered using the same mental framework.

---

# Part 21 — One correction I want you to make immediately

Your Round 1 response probably sounded something like:

> "I would test different inputs and edge cases."

That's too vague.

When they ask:

> "How would you test it?"

**Name categories and give examples.**

Instead of:

> "I will check edge cases."

Say:

> "I'd test invalid inputs such as missing features and negative amounts, boundary cases around the decision threshold, duplicate transactions, extreme transaction amounts, and model failures."

Now the interviewer can see your thinking.

---

# Part 22 — The biggest lesson from your first interview

You weren't necessarily failing because you didn't know testing.

You were failing because when they said:

> "Test this."

you didn't have a **method for generating test cases**.

Now you do.

Whenever they give you any system:

```text
                   WHAT CAN GO WRONG?
                           │
       ┌─────────┬─────────┼─────────┬─────────┐
       ↓         ↓         ↓         ↓         ↓
     Input    Boundary   Logic     Output    Failure
```

And then:

```text
            NORMAL + INVALID + EXTREME
```

That's your brain's checklist.

---

# Part 23 — One more important distinction

Don't claim things your project doesn't implement.

Your own interview document explicitly marks several things as conceptual rather than implemented, including cross-validation, Isolation Forest, autoencoders and a real-time inference API. 

So if they ask:

> "Did you deploy this as an API?"

Don't say yes.

Say:

> "No. My current project is a notebook-based pipeline. I saved the scaler and trained models for repeatable inference, but I didn't implement a production API."

That honesty is important.

---

# Now we're ready for the actual training

I don't want to dump 50 questions on you. That will recreate your memorization problem.

We will do this **interactively**, but now with your real project.

### Interview Question 1

Imagine you are sitting in Monday's interview.

The interviewer looks at your resume and says:

> **"You mentioned Credit Card Fraud Detection on your resume. Don't explain the ML algorithm yet. From a software testing perspective, how would you test this project?"**

Answer **in your own words**, even if the answer is bad.

I will then tear it apart, show you exactly what an SDET interviewer expects, and make you answer the follow-up:

> **"Okay. Give me five specific test cases."**

That is the right way to fix the exact weakness that hurt you in Round 1.
