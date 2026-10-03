### Q1. Tell me about your project.

**Answer:**

> My project is an LSTM-based next-word prediction system. The idea is to take a sequence of words as input and predict what word is most likely to come next.
>
> I first converted the text sentences into integer sequences using the Keras Tokenizer. Then I generated multiple partial sequences from each sentence—for example, from a sentence like “the sky is blue”, I created sequences such as “the sky”, “the sky is”, and “the sky is blue”.
>
> I padded these sequences to a fixed length of 26, separated the input and target, and one-hot encoded the target word.
>
> The model consists of an Embedding layer, an LSTM layer, and a Dense softmax output layer. The Dense layer predicts a probability distribution across the vocabulary.
>
> I also performed hyperparameter tuning on dropout, embedding dimension, and LSTM units, and finally saved the trained model, tokenizer, and maximum sequence length for later inference.   

---

# 2. Questions they can ask immediately about your project

### Q2. Why did you use LSTM?

**Answer:**

> LSTM is a type of recurrent neural network designed for sequential data. Text is sequential because the meaning of a word depends on the surrounding words. LSTM uses gated mechanisms to retain useful information and reduce the vanishing-gradient problem of traditional RNNs, so it is suitable for next-word prediction.

### Q3. Why not a simple RNN?

**Answer:**

> A simple RNN can struggle to preserve information over longer sequences because of vanishing gradients. LSTM has gates such as the input, forget, and output gates that help it retain or discard information more effectively.

### Q4. Why not CNN?

**Answer:**

> CNNs are good at learning local patterns, while LSTM is designed specifically for sequential dependencies. For language prediction, the order of words matters, so LSTM is a natural choice.

### Q5. What is the actual task your model solves?

**Answer:**

> It is a multi-class classification problem where each possible next word in the vocabulary is treated as a class.

That is directly supported by your code: your output has one class for each vocabulary token and uses softmax. 

---

# 3. Dataset questions

### Q6. How large is your dataset?

**Answer:**

> The notebook contains 173 sentences. After converting them into partial next-word sequences, I obtained 1,717 training samples.  

### Q7. How many unique words are there?

**Answer:**

> The tokenizer found 654 unique words. 

### Q8. Is 173 sentences a large dataset for an LSTM?

**Answer:**

> No. It is very small for a language model. It is enough for demonstrating the pipeline, but it is not sufficient for a production-quality next-word prediction system. With such a small dataset, the model can memorize patterns and generalize poorly.

**This is an important answer. Don't pretend your dataset is large.**

---

# 4. Tokenization questions

### Q9. What is tokenization?

**Answer:**

> Tokenization converts text into smaller units, such as words, and then assigns each word a numerical ID so that a neural network can process it.

Your notebook uses:

```python
Tokenizer(num_words=500, oov_token='<nothing>')
```



### Q10. What is `word_index`?

**Answer:**

> `word_index` is a dictionary mapping each word to its integer token ID.

For example, the notebook shows mappings such as `"the": 2`, `"and": 3`, `"a": 4`. 

### Q11. What is `word_counts`?

**Answer:**

> It stores how many times each word occurs in the dataset. 

### Q12. What is `document_count`?

**Answer:**

> It represents the number of text documents or sentences supplied to the tokenizer. In this notebook it is 173. 

---

# 5. OOV questions

### Q13. Why did you use `oov_token`?

**Answer:**

> OOV means out-of-vocabulary. If a word appears during prediction that the tokenizer did not learn during training, instead of completely discarding it, the tokenizer maps it to a special OOV token.

Your tokenizer explicitly uses:

```python
oov_token='<nothing>'
```



### Q14. What happens when an unknown word appears?

**Answer:**

> It gets mapped to the OOV token index. In this project that special token is represented in the tokenizer vocabulary.

### Q15. Why is OOV handling important in production?

**Answer:**

> Real-world text contains typos, new words, names, slang and domain-specific vocabulary. Without OOV handling, unseen words can be discarded and useful information may be lost.

---

# 6. One question I EXPECT them to ask

### Q16. What happens here?

```python
tokenizer.texts_to_sequences('the teacher is on the box')
```

**Correct answer:**

> A single string should not be passed directly here. `texts_to_sequences()` expects a sequence of texts, such as a list of strings. The notebook itself demonstrates that passing a plain string can cause it to be interpreted incorrectly. The safer version is:
>
> ```python
> tokenizer.texts_to_sequences(['the teacher is on the box'])
> ```
>
> This returns a list containing the tokenized sequence.

Your notebook explicitly demonstrates this issue. 

This is exactly the kind of thing an interviewer can use to check whether you understand your code rather than memorized it.

---

# 7. Sequence generation

### Q17. Why didn't you simply use the complete sentence as one training sample?

**Answer:**

> Because I wanted the model to learn multiple next-word prediction examples from every sentence. I generated progressively longer sequences. For example, a tokenized sentence `[2, 28, 8, 149]` produces `[2,28]`, `[2,28,8]`, and `[2,28,8,149]`.

That is exactly what your loop does. 

### Q18. What are X and Y?

**Answer:**

> `X` contains the previous words used as input, and `Y` contains the next word that the model should predict.

Your code creates:

```python
X = pad_sequences[:, 0:-1]
Y = pad_sequences[:, -1]
```



### Q19. What are their shapes?

**Answer:**

> Before one-hot encoding, `X` has shape `(1717, 25)` and `Y` has shape `(1717,)`. After one-hot encoding, `Y` has shape `(1717, 655)`.  

Be careful here: **your comments contain a few inconsistent statements about 654 versus 655 output classes. The actual model summary shows 655.**

---

# 8. Padding questions

### Q20. Why do you need padding?

**Answer:**

> Different sentences produce sequences of different lengths, but neural networks generally require inputs in a consistent tensor shape for batch processing. Padding makes all sequences the same length.

### Q21. What type of padding did you use?

**Answer:**

> I used pre-padding:

```python
padding='pre'
```

So zeros are added at the beginning of shorter sequences. 

### Q22. Why did you use `max_length`?

**Answer:**

> I used the maximum observed sequence length so that every sequence could be represented with the same number of positions.

The notebook calculates `max_length` as 26. 

### Q23. What is `mask_zero=True`?

**Answer:**

> It tells the Embedding layer that token ID zero represents padding and should be ignored by downstream compatible layers such as LSTM.

Your model explicitly uses `mask_zero=True`. 

---

# 9. Embedding questions

### Q24. What is an Embedding layer?

**Answer:**

> An embedding layer converts integer word IDs into dense numerical vectors. Instead of treating word IDs as unrelated numbers, it learns a vector representation for each word.

### Q25. Why not directly feed token IDs into the LSTM?

**Answer:**

> Token IDs are arbitrary integer labels. For example, token 2 isn't mathematically “closer” to token 3 than token 500. Embeddings learn a continuous representation that can encode relationships between words.

### Q26. What is your embedding dimension?

**Answer:**

> The final model uses an embedding dimension of 50. The Embedding layer converts each of the 25 input tokens into a 50-dimensional vector, producing an output shape of `(batch_size, 25, 50)`. 

---

# 10. LSTM questions

### Q27. How many LSTM units did you use?

**Answer:**

> The final model uses 50 LSTM units. 

### Q28. What does `return_sequences=False` mean?

**Answer:**

> It means the LSTM returns only the final hidden representation rather than the hidden state at every timestep. That final representation is then passed to the Dense layer to predict the next word.

Because you don't specify it, Keras uses the default `False`. 

### Q29. What would happen if you set `return_sequences=True`?

**Answer:**

> The LSTM would return an output for every timestep. That would change the tensor shape and would normally be used when another sequence-processing layer follows it.

---

# 11. Dense and Softmax questions

### Q30. Why do you have 655 neurons in the Dense layer?

**Answer:**

> Because the target is the next word and the model needs one output class for every possible token index, including the additional index represented in the output dimension. The final architecture has 655 outputs. 

### Q31. Why softmax?

**Answer:**

> Because this is a multi-class classification problem where exactly one next-word class is selected. Softmax converts the output logits into probabilities that sum to one.

### Q32. What does the output represent?

**Answer:**

> It represents a probability distribution over the possible next words. The word with the highest probability can be selected as the predicted next word.

---

# 12. One-hot encoding

### Q33. Why did you one-hot encode Y?

**Answer:**

> Since the target is a categorical class—the next word—I converted its integer class index into a one-hot vector so that it can be compared against the model's softmax probability distribution using categorical cross-entropy.

Your code uses `to_categorical`. 

### Q34. What is categorical cross-entropy?

**Answer:**

> It measures how different the predicted probability distribution is from the true one-hot target distribution. A high probability assigned to the correct class gives lower loss, while assigning low probability to the correct class gives higher loss.

---

# 13. Optimizer questions

### Q35. Which optimizer did you use?

**Answer:**

> Adam.



### Q36. Why Adam?

**Answer:**

> Adam adapts the learning rate for different parameters using estimates of first and second moments of the gradients. It generally converges well and is a strong default optimizer for neural networks.

### Q37. What happens if the learning rate is too high?

**Answer:**

> Training can become unstable. The loss may oscillate or diverge rather than converge.

### Q38. What happens if it is too low?

**Answer:**

> Training becomes slow and may get stuck making very small improvements.

---

# 14. Dropout questions

### Q39. Why did you use dropout?

**Answer:**

> Dropout is a regularization technique. During training, it randomly drops a fraction of activations, which reduces reliance on particular neurons and can help reduce overfitting.

Your final LSTM uses `dropout=0.5`. 

### Q40. Why 0.5?

**Answer:**

> It was one of the hyperparameters I explored. I tested dropout values from 0.2 to 0.5 during tuning. 

Do **not** say:

> “0.5 is the optimal dropout value.”

Your notebook does not establish that.

---

# 15. Hyperparameter tuning

### Q41. What hyperparameters did you tune?

**Answer:**

> I tuned:
>
> * dropout rate: 0.2, 0.3, 0.4, 0.5
> * embedding dimension: 10, 15, 23, 25, 30
> * LSTM units: 10, 15, 20, 25, 30
>
> I used `itertools.product()` to evaluate the combinations. 

### Q42. How many combinations did that create?

There are:

$$4 \times 5 \times 5 = 100$$

combinations.

### Q43. What kind of hyperparameter search is this?

**Answer:**

> It is essentially a grid search implemented manually using Cartesian products.

### Q44. What is the problem with your tuning approach?

**Strong answer:**

> The search is computationally expensive because every combination is trained for many epochs. More importantly, the dataset is very small, so repeated tuning against the same validation split can indirectly overfit to the validation set. A separate test set would provide a cleaner final evaluation.

That answer will make you sound considerably more credible than pretending the tuning is perfect.

---

# 16. The BIGGEST testing/SDET questions

This is where you need to change mindset.

The interviewer isn't necessarily asking:

> “Explain LSTM.”

They may ask:

> **“How would you test this project?”**

### Q45. How would you test your model?

**Answer:**

> I would test it at multiple levels.
>
> First, unit-test the preprocessing functions: tokenization, sequence generation, padding and X/Y generation.
>
> Second, test the model interface: input shape, output shape and probability validity.
>
> Third, test functional prediction using known sequences where the expected next word is known.
>
> Fourth, test edge cases such as an empty string, unknown words, very long input, very short input and punctuation.
>
> Finally, evaluate model quality using an unseen test dataset rather than relying only on training accuracy.

---

# 17. Test cases they could ask you to design

### Q46. Give me test cases for your tokenizer.

**Answer:**

1. Normal sentence.
2. Empty string.
3. Unknown words.
4. Multiple spaces.
5. Uppercase/lowercase input.
6. Numeric characters.
7. Punctuation.
8. Very long sentence.
9. Special characters.
10. Completely unseen vocabulary.

---

### Q47. Give me negative test cases.

**Answer:**

> Empty input, null input, whitespace-only input, extremely long input, input containing only unknown words, malformed data, unsupported characters and a token sequence that exceeds the expected maximum length.

---

# 18. Model validation testing

### Q48. How would you verify the model output?

**Answer:**

> I would verify that the output has the expected shape `(batch_size, 655)`, that all values are valid probabilities, that probabilities sum approximately to 1 for each sample, and that the predicted class corresponds to a valid vocabulary index.

### Q49. What if the model returns NaN?

**Answer:**

> I would treat it as a failure. I would inspect the input data, loss values, gradients, learning rate, numerical stability and model configuration.

### Q50. What if the model returns a negative probability?

**Answer:**

> With softmax that should not happen. If it did, I would investigate whether the output is actually pre-softmax logits or whether there is an implementation issue.

---

# 19. Boundary-value testing

### Q51. How would you perform boundary testing?

**Answer:**

> I would test inputs at and around the maximum sequence length: empty input, one token, 24 tokens, 25 tokens, 26 tokens and more than 26 tokens. I would verify that preprocessing produces the expected shape and that the model doesn't crash.

This is a very strong SDET answer because it ties testing directly to your implementation.

---

# 20. Integration testing

### Q52. What would integration testing mean in this project?

**Answer:**

> I would test the complete pipeline rather than individual functions:
>
> raw text → tokenizer → integer sequence → padding → model → probability output → predicted word.
>
> The goal is to verify that the components work correctly together.

---

# 21. Regression testing

### Q53. Give me a regression test for this project.

**Answer:**

> After changing the tokenizer or model architecture, I would run a fixed set of known input sentences and verify that preprocessing still produces valid shapes, the model still loads successfully, and predictions remain within the expected vocabulary.

---

# 22. Smoke testing

### Q54. What would be your smoke test?

**Answer:**

> Load the saved model and tokenizer, provide a valid sentence, run prediction, verify that inference completes without errors, verify the output shape, and verify that a valid word is returned.

Your project explicitly saves `next_word_model.keras`, `tokenizer.pkl`, and `max_length.txt`, so this is particularly relevant. 

---

# 23. Critical interviewer attack: your validation result

### Q55. Your training accuracy is 36%, but validation accuracy is only 14.5%. What does that tell you?

**Answer:**

> It indicates poor generalization. The model is learning the training data better than it can generalize to validation data. The increasing gap suggests overfitting, although the very small dataset also contributes to instability.

Your notebook actually shows training accuracy rising while validation accuracy stays around 10–14%, with validation loss increasing substantially. 

### Q56. How would you improve it?

**Answer:**

> I would first increase the dataset significantly, then use a proper train/validation/test split. I would also use early stopping, tune the model with a cleaner validation strategy, consider reducing model complexity, and evaluate the model using top-k accuracy rather than only top-1 accuracy because multiple next words can be plausible.

---

# 24. Early stopping

### Q57. Did you use early stopping?

**Answer:**

> I defined an EarlyStopping callback in the notebook with `val_loss`, patience of 15 and `restore_best_weights=True`, but it was commented out and therefore not actually used in the final training run. 

This is a **very important distinction**.

Never say:

> “Yes, I used early stopping.”

That would be factually wrong based on the notebook.

---

# 25. Data leakage question

### Q58. Do you have any data leakage concerns?

**Answer:**

> Yes. The tokenizer is fitted on the complete dataset before the validation split is created by `model.fit(validation_split=0.2)`. This means vocabulary information from the validation portion is available to preprocessing before the model is trained. A stricter pipeline would fit the tokenizer only on the training split and then transform validation and test data using that tokenizer.

This is a sophisticated answer and demonstrates real ML-testing awareness.

---

# 26. Dataset quality question

### Q59. What is a major problem with your dataset?

**Answer:**

> It is extremely small and the vocabulary is large relative to the amount of text. There are 654 unique words from only 173 sentences. That makes the next-word prediction task sparse and difficult to generalize.

The tokenizer reports 654 unique words and 173 documents.  

---

# 27. Why accuracy alone is weak here

### Q60. Why isn't accuracy enough?

**Answer:**

> Because next-word prediction has many plausible answers. If the true next word is “car” but the model predicts “vehicle,” accuracy counts that as completely wrong even though it may be semantically reasonable. Therefore top-k accuracy is often more informative.

### Q61. What is top-k accuracy?

**Answer:**

> Instead of requiring the correct word to be the single highest-probability prediction, we check whether it appears among the top k predictions.

For example, with top-5 accuracy, a prediction is considered correct if the actual next word is among the five highest-probability words.

---

# 28. Serialization questions

### Q62. Why save the tokenizer?

**Answer:**

> The model only understands token IDs, not raw text. During inference we need the exact same tokenizer and word-to-index mapping used during training.

### Q63. Why save `max_length`?

**Answer:**

> Because the inference input needs to be padded or truncated using the same sequence length used during training.

### Q64. Why save the model separately?

**Answer:**

> So it can be loaded later without retraining.

---

# 29. What happens if the tokenizer changes?

### Q65. Suppose someone trains the model with one tokenizer but uses a new tokenizer during inference. What happens?

**Answer:**

> The token IDs may no longer correspond to the same words, so the model receives semantically incorrect inputs. Predictions can become meaningless even though the model itself loads successfully.

This is exactly the sort of production failure an SDET should catch.

---

# 30. Test the saved artifacts

### Q66. How would you test model persistence?

**Answer:**

> I would save the model, tokenizer and sequence length, reload them in a fresh process, run the same test inputs before and after saving, and verify that the predictions are consistent.

---

# 31. Exception testing

### Q67. What exceptions should your inference code handle?

**Answer:**

> Missing model file, missing tokenizer file, corrupted model file, invalid input type, empty input, tokenizer failure and unexpected sequence lengths.

---

# 32. Performance testing

### Q68. How would you performance-test the model?

**Answer:**

> I would measure inference latency, throughput, memory consumption and CPU/GPU utilization under different input sizes and concurrent requests.

### Q69. What would you stress-test?

**Answer:**

> Large numbers of prediction requests, long input sequences, repeated requests, malformed requests and simultaneous inference calls.

---

# 33. Reliability / robustness

### Q70. What robustness tests would you perform?

**Answer:**

> I would test spelling errors, unknown vocabulary, punctuation, different casing, very short sentences, long sentences, repeated words and nonsensical input to see whether the system fails gracefully.

---

# 34. Security questions

An SDET interviewer may unexpectedly ask these.

### Q71. Is model testing only functional testing?

**Answer:**

> No. It also includes performance, reliability, security, compatibility, data-quality and regression testing.

### Q72. Is `pickle` completely safe?

**Answer:**

> No. Pickle should not be blindly loaded from untrusted sources because deserialization can execute arbitrary code. In production, I would only load trusted serialized artifacts or use a safer serialization strategy where appropriate.

Your notebook uses pickle for the tokenizer. 

---

# 35. SDET automation questions

### Q73. How would you automate this project?

**Answer:**

> I would separate the system into testable components:
>
> 1. preprocessing tests,
> 2. tokenizer tests,
> 3. sequence-generation tests,
> 4. model-shape tests,
> 5. inference tests,
> 6. saved-model loading tests,
> 7. negative and boundary tests,
> 8. regression tests.
>
> I would use Python with pytest, fixtures for loading shared artifacts, parameterization for multiple inputs, and assertions for expected shapes and outputs.

### Q74. What would you mock?

**Answer:**

> I would mock external dependencies such as file loading or external services if the production system had them. I would not mock the actual neural network when I am specifically testing model inference behavior.

### Q75. What would you parameterize?

**Answer:**

> Input sentences, empty inputs, unknown-word inputs, boundary-length inputs and expected preprocessing behavior are good candidates for parameterization.

---

# 36. Unit test example they could ask

### Q76. How would you unit-test tokenization?

**Answer:**

> Given a known sentence and a fixed tokenizer, I would verify that the resulting sequence contains the expected token IDs and that unknown words map to the expected OOV token.

---

# 37. Unit vs integration

### Q77. Difference between unit testing and integration testing in your project?

**Answer:**

> Unit testing checks one component in isolation—for example, whether preprocessing generates the correct sequence.
>
> Integration testing checks whether multiple components work together—for example, raw text being converted to tokens, padded, passed into the model and converted into a predicted word.

---

# 38. Regression scenario

### Q78. Suppose you change the embedding dimension from 50 to 100. What tests will you run?

**Answer:**

> I would verify that the model builds successfully, the Embedding output shape changes as expected, downstream LSTM shapes remain valid, inference works, the model saves and loads correctly, and the existing regression test suite still passes.

---

# 39. A very strong question

### Q79. How do you know your model is actually predicting words rather than memorizing the training sentences?

**Answer:**

> I would evaluate it on truly unseen sentences from a held-out test set. I would compare training and validation/test performance and inspect predictions on examples that were not present during training. Given the current dataset and low validation accuracy, I would not claim strong generalization.

That is the honest answer.

---

# 40. Questions you MUST be able to answer tomorrow

Memorize these first:

| Priority  | Question                                           |
| --------- | -------------------------------------------------- |
| VERY HIGH | Explain your project                               |
| VERY HIGH | Why LSTM?                                          |
| VERY HIGH | How does tokenization work?                        |
| VERY HIGH | What is embedding?                                 |
| VERY HIGH | Why padding?                                       |
| VERY HIGH | Explain X and Y                                    |
| VERY HIGH | Why softmax?                                       |
| VERY HIGH | Why categorical cross-entropy?                     |
| VERY HIGH | What is dropout?                                   |
| VERY HIGH | What did you test?                                 |
| VERY HIGH | How would you automate testing?                    |
| VERY HIGH | Give positive/negative test cases                  |
| VERY HIGH | How would you test unknown words?                  |
| VERY HIGH | How would you test empty input?                    |
| VERY HIGH | What does the 14.53% validation accuracy mean?     |
| HIGH      | What is overfitting?                               |
| HIGH      | What is regression testing?                        |
| HIGH      | What is integration testing?                       |
| HIGH      | What is boundary testing?                          |
| HIGH      | What is smoke testing?                             |
| HIGH      | What is parameterization?                          |
| HIGH      | What happens when tokenizer and model don't match? |
| HIGH      | How would you test saved model loading?            |
| HIGH      | Why save tokenizer?                                |
| HIGH      | Why save max length?                               |
| HIGH      | How would you improve the model?                   |

## The biggest weakness you need to prepare for

I'm going to be blunt: **your project is very easy for an interviewer to attack if you present it as a production-ready ML system.**

The notebook has only 173 sentences, 654 unique words, and the best validation accuracy is only 14.53%.   

So don't defend it with:

> “My model performs very well.”

Instead say:

> **“The primary objective of the project was to implement and understand the complete next-word prediction pipeline using LSTM—from tokenization and sequence generation to model training, evaluation and model persistence. The current implementation is a prototype, and the main limitation is the small dataset and weak validation generalization.”**

That answer is defensible.

And for an **SDET interview**, that honesty is actually useful because it gives you an opening to discuss how you would test and improve the system rather than getting trapped defending a 14.5% validation score.

We now have enough information from your notebook to build a **much larger project-specific interview bank**—including the exact “interviewer asks → your answer → likely follow-up → best follow-up answer” chain. That is what I would focus on tonight.
