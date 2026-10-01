export type Topic = {
  id: string;
  title: string;
  description: string;
  lessons: string[];
  status?: "recommended" | "available";
};

export type Level = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  topics: Topic[];
};

export type Question = {
  id: string;
  topicId: string;
  topic: string;
  difficulty: "Foundational" | "Developing" | "Applied";
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

export const curriculum: Level[] = [
  { id: "foundations", number: 1, title: "AI Foundations", subtitle: "Build an accurate mental model of AI.", topics: [
    { id: "what-is-ai", title: "What is AI?", description: "Understand what AI systems do, where they work, and where they stop.", lessons: ["A map of artificial intelligence", "Limits, patterns and predictions"] },
    { id: "ai-systems", title: "AI systems & components", description: "See how data, models, objectives and feedback form a working system.", lessons: ["Inside an AI system"] },
    { id: "responsible-basics", title: "Limitations & responsible use", description: "Recognize uncertainty, bias, privacy and the role of human judgment.", lessons: ["When an AI answer is not enough"] },
  ]},
  { id: "data-math", number: 2, title: "Data & Mathematical Foundations", subtitle: "Learn the language models use to learn.", topics: [
    { id: "data", title: "Data, features & labels", description: "Turn real-world observations into useful learning examples.", lessons: ["From messy data to a dataset"] },
    { id: "statistics", title: "Statistics & probability", description: "Use distributions, averages and uncertainty to reason with evidence.", lessons: ["Averages can hide the story"] },
    { id: "vectors", title: "Vectors, matrices & optimization", description: "Build intuitive math foundations without losing the big picture.", lessons: ["Vectors as useful coordinates"] },
    { id: "splits", title: "Train, validation & test data", description: "Measure generalization rather than memorization.", lessons: ["A fair test for a model"] },
  ]},
  { id: "machine-learning", number: 3, title: "Machine Learning", subtitle: "Teach systems from examples and evaluate them honestly.", topics: [
    { id: "ml-core", title: "Learning from examples", description: "Connect supervised, unsupervised and reinforcement learning.", lessons: ["How a model learns"] },
    { id: "ml-methods", title: "Classification, regression & clustering", description: "Choose an approach based on the question and available signal.", lessons: ["Three ways to learn from data"] },
    { id: "model-quality", title: "Training, errors & evaluation", description: "Understand overfitting, metrics, cross-validation and error analysis.", lessons: ["A model is a hypothesis"] },
    { id: "ml-tools", title: "Features & model selection", description: "Prepare inputs and compare models with a repeatable process.", lessons: ["A practical modeling loop"] },
  ]},
  { id: "deep-learning", number: 4, title: "Neural Networks & Deep Learning", subtitle: "Understand the engines behind modern AI.", topics: [
    { id: "neural-networks", title: "Neurons, layers & activations", description: "Trace inputs through a network and see how representations form.", lessons: ["A network learns representations"] },
    { id: "training-deep", title: "Loss, gradient descent & backpropagation", description: "Connect error signals to parameter updates.", lessons: ["How training nudges a model"] },
    { id: "architectures", title: "CNNs, sequences & transformers", description: "Understand why architecture changes what a model can notice.", lessons: ["Architectures match patterns"] },
    { id: "adaptation", title: "Transfer learning & fine-tuning", description: "Adapt useful representations to a new task responsibly.", lessons: ["Reuse before you retrain"] },
  ]},
  { id: "nlp", number: 5, title: "Natural Language Processing", subtitle: "Help machines work with human language.", topics: [
    { id: "nlp-basics", title: "Text, tokens & vocabulary", description: "See how text becomes a sequence a model can process.", lessons: ["From words to token IDs"] },
    { id: "nlp-tasks", title: "Language tasks & evaluation", description: "Explore classification, extraction, similarity and generation.", lessons: ["Choosing an NLP task"] },
    { id: "language-models", title: "Language modeling", description: "Understand prediction, context and sequence limitations.", lessons: ["Predicting what comes next"] },
  ]},
  { id: "vision", number: 6, title: "Computer Vision", subtitle: "Teach systems to interpret images and visual scenes.", topics: [
    { id: "vision-data", title: "Images as data", description: "Pixels, channels, tensors and the choices that shape visual learning.", lessons: ["A picture is a grid of numbers"] },
    { id: "vision-tasks", title: "Classification, detection & segmentation", description: "Match the visual question to the right output.", lessons: ["Three ways to describe an image"] },
  ]},
  { id: "generative-ai", number: 7, title: "Generative AI", subtitle: "Understand systems that create new content.", topics: [
    { id: "genai-core", title: "Generative vs discriminative models", description: "Distinguish creating examples from assigning labels.", lessons: ["What does it mean to generate?"] },
    { id: "genai-eval", title: "Capabilities, hallucinations & evaluation", description: "Evaluate useful outputs without confusing fluency with truth.", lessons: ["A confident answer can still be wrong"] },
    { id: "diffusion", title: "Diffusion model intuition", description: "Build a visual intuition for iterative generation.", lessons: ["Making an image from noise"] },
  ]},
  { id: "llms", number: 8, title: "Large Language Models", subtitle: "Go inside the models behind modern language tools.", topics: [
    { id: "llm-core", title: "Tokens, embeddings & attention", description: "Connect the core building blocks of transformer language models.", lessons: ["How an LLM represents context"] },
    { id: "llm-training", title: "Pretraining & instruction tuning", description: "Understand how general capability becomes useful interaction.", lessons: ["From next-token prediction to assistance"] },
    { id: "llm-inference", title: "Context, decoding & evaluation", description: "Reason about sampling, context windows and model behavior.", lessons: ["Why the same prompt can vary"] },
  ]},
  { id: "prompting", number: 9, title: "Prompt Engineering & AI Workflows", subtitle: "Design clearer, more reliable interactions.", topics: [
    { id: "prompting-core", title: "Instructions, context & constraints", description: "Make the task, inputs and success criteria explicit.", lessons: ["A prompt is an interface"] },
    { id: "prompting-advanced", title: "Examples, decomposition & structured output", description: "Guide reasoning and make outputs easier to check.", lessons: ["Designing a reliable prompt"] },
    { id: "prompt-eval", title: "Prompt evaluation & privacy", description: "Test workflows and handle sensitive data thoughtfully.", lessons: ["Measure before you trust"] },
  ]},
  { id: "rag", number: 10, title: "Embeddings, Retrieval & RAG", subtitle: "Ground generation in information you can inspect.", topics: [
    { id: "embeddings", title: "Semantic embeddings & similarity", description: "Represent meaning as useful geometry.", lessons: ["Meaning as a location"] },
    { id: "retrieval", title: "Chunking, indexing & retrieval", description: "Prepare a knowledge base and find relevant context.", lessons: ["Retrieval starts before the model"] },
    { id: "rag", title: "RAG architecture & evaluation", description: "Connect retrieval to generation with grounding and citations.", lessons: ["A grounded answer pipeline"] },
  ]},
  { id: "agents", number: 11, title: "AI Agents & Tool Use", subtitle: "Design multi-step systems with control and safeguards.", topics: [
    { id: "agent-core", title: "Models, tools, state & control flow", description: "Understand the pieces that make an agentic system.", lessons: ["An agent is a loop with choices"] },
    { id: "agent-reliability", title: "Planning, memory & reliability", description: "Evaluate and constrain multi-step behavior.", lessons: ["Make tool use observable"] },
  ]},
  { id: "fine-tuning", number: 12, title: "Fine-Tuning & Model Adaptation", subtitle: "Choose the lightest adaptation that solves the problem.", topics: [
    { id: "adaptation-strategy", title: "Prompting vs retrieval vs fine-tuning", description: "Select an adaptation strategy based on the source of the gap.", lessons: ["The right lever for the right gap"] },
    { id: "fine-tuning", title: "Datasets, SFT & LoRA", description: "Understand efficient adaptation and its tradeoffs.", lessons: ["Teaching a model a new pattern"] },
  ]},
  { id: "mlops", number: 13, title: "Deployment & MLOps", subtitle: "Move from a notebook to a dependable product.", topics: [
    { id: "serving", title: "Serving, latency & throughput", description: "Design an inference path users can rely on.", lessons: ["A model in the real world"] },
    { id: "monitoring", title: "Monitoring, drift & versioning", description: "Keep quality visible after launch.", lessons: ["Production is a new dataset"] },
    { id: "mlops-security", title: "Cost, security & privacy", description: "Balance experience, risk and operational reality.", lessons: ["Responsible operations"] },
  ]},
  { id: "responsible-ai", number: 14, title: "Responsible AI", subtitle: "Build with fairness, safety and human oversight.", topics: [
    { id: "fairness", title: "Bias, fairness & explainability", description: "Find where systems can fail different people differently.", lessons: ["Fairness is a design process"] },
    { id: "safety-privacy", title: "Privacy, safety & robustness", description: "Reduce harm through constraints, testing and escalation.", lessons: ["Designing for uncertainty"] },
    { id: "provenance", title: "Accessibility, copyright & provenance", description: "Trace sources and make systems usable and accountable.", lessons: ["Where did this output come from?"] },
  ]},
  { id: "projects", number: 15, title: "Practical Projects & Capstone", subtitle: "Turn understanding into evidence you can show.", topics: [
    { id: "project-analysis", title: "Analyze an AI application", description: "Map a real system's goal, data, model and risks.", lessons: ["Reverse-engineer an AI product"] },
    { id: "project-rag", title: "Build a document Q&A RAG project", description: "Create a grounded prototype with evaluation criteria.", lessons: ["From documents to cited answers"] },
    { id: "project-agent", title: "Design a tool-using workflow", description: "Build, test and reflect on a supervised agent workflow.", lessons: ["A small agent with boundaries"] },
    { id: "capstone", title: "Final project", description: "Choose a project that connects your goal to measurable learning evidence.", lessons: ["Plan, build, evaluate, reflect"] },
  ]},
];

export const questions: Question[] = [
  { id: "q1", topicId: "what-is-ai", topic: "AI Foundations", difficulty: "Foundational", prompt: "Which description best captures what a machine-learning model does?", options: ["It follows only hand-written rules", "It learns patterns from examples to make predictions", "It understands the world exactly like a person", "It always produces a correct answer"], answer: 1, explanation: "A model maps inputs to outputs using patterns learned from examples. That can be useful without implying human-like understanding or guaranteed correctness." },
  { id: "q2", topicId: "data", topic: "Data & Statistics", difficulty: "Foundational", prompt: "In a dataset about homes, which could be a feature?", options: ["The predicted sale price", "The model's accuracy", "The number of bedrooms", "The final evaluation"], answer: 2, explanation: "A feature is an input signal used to make a prediction. The sale price would usually be the label in this example." },
  { id: "q3", topicId: "statistics", topic: "Data & Statistics", difficulty: "Developing", prompt: "Why can the median be more useful than the mean for a highly skewed income dataset?", options: ["It ignores every data point", "It is less pulled by extreme values", "It always equals the most common value", "It measures correlation"], answer: 1, explanation: "The median is the middle value after sorting, so an unusually large income does not pull it upward as strongly as it pulls the mean." },
  { id: "q4", topicId: "splits", topic: "Data & Statistics", difficulty: "Developing", prompt: "What is the main purpose of a test set?", options: ["To tune the model repeatedly", "To provide a final estimate on unseen data", "To replace the training data", "To guarantee no bias"], answer: 1, explanation: "A held-out test set gives a more honest final estimate of how the chosen model generalizes to new examples." },
  { id: "q5", topicId: "ml-core", topic: "Machine Learning", difficulty: "Foundational", prompt: "Which is a supervised-learning task?", options: ["Grouping customers without labels", "Predicting house prices from labeled examples", "Compressing an image file", "Randomly shuffling a dataset"], answer: 1, explanation: "Supervised learning uses examples where the desired answer or label is known, such as historical house prices." },
  { id: "q6", topicId: "ml-methods", topic: "Machine Learning", difficulty: "Developing", prompt: "A model predicts whether an email is spam or not spam. What kind of output is this?", options: ["Classification", "Regression", "Clustering", "Dimensionality reduction"], answer: 0, explanation: "The model chooses between discrete categories, which makes this a classification problem." },
  { id: "q7", topicId: "model-quality", topic: "Machine Learning", difficulty: "Developing", prompt: "A model scores very well on training examples but poorly on new examples. What is the likely issue?", options: ["Underfitting", "Overfitting", "No features exist", "The test set trained the model"], answer: 1, explanation: "Overfitting happens when a model memorizes details of its training examples and fails to generalize." },
  { id: "q8", topicId: "model-quality", topic: "Machine Learning", difficulty: "Applied", prompt: "For a disease-screening system where missing a true case is costly, which metric deserves special attention?", options: ["Recall", "File size", "Training time only", "Number of features"], answer: 0, explanation: "Recall measures how many of the actual positive cases the system finds. Precision also matters, but the cost of false negatives makes recall central here." },
  { id: "q9", topicId: "neural-networks", topic: "Deep Learning", difficulty: "Foundational", prompt: "What does a weight in a neural network control?", options: ["The screen brightness", "How strongly an input contributes", "The number of labels in a dataset", "Whether data is private"], answer: 1, explanation: "Weights scale signals as they move through a network. Training adjusts them to reduce prediction error." },
  { id: "q10", topicId: "training-deep", topic: "Deep Learning", difficulty: "Applied", prompt: "What is the role of a loss function during training?", options: ["It measures how far predictions are from targets", "It writes the final product brief", "It labels every image by hand", "It prevents all uncertainty"], answer: 0, explanation: "The loss summarizes prediction error. An optimizer uses its signal to update model parameters." },
  { id: "q11", topicId: "nlp-basics", topic: "NLP", difficulty: "Foundational", prompt: "Why are words often converted into tokens before entering a language model?", options: ["Models can only process structured numeric inputs", "To remove all ambiguity from language", "To guarantee perfect grammar", "Because tokens are always whole words"], answer: 0, explanation: "Tokens provide a manageable vocabulary of units that can be mapped to numbers. A token may be a whole word, part of a word, or punctuation." },
  { id: "q12", topicId: "language-models", topic: "NLP", difficulty: "Developing", prompt: "A language model is commonly trained to predict what?", options: ["The next token given context", "A user's private thoughts", "The exact future", "Which dataset is largest"], answer: 0, explanation: "Next-token prediction is a core pretraining objective. It can lead to rich capabilities, but it does not make the model a source of guaranteed truth." },
  { id: "q13", topicId: "vision-data", topic: "Computer Vision", difficulty: "Foundational", prompt: "What does a pixel value represent in a simple grayscale image?", options: ["A small location's intensity", "A complete object label", "The model's confidence only", "The image's file name"], answer: 0, explanation: "A pixel stores information about a small location in an image, such as light intensity in grayscale." },
  { id: "q14", topicId: "vision-tasks", topic: "Computer Vision", difficulty: "Developing", prompt: "Which task draws a box around each detected object?", options: ["Image classification", "Object detection", "Text generation", "Clustering only"], answer: 1, explanation: "Object detection identifies object classes and locations, commonly represented with bounding boxes." },
  { id: "q15", topicId: "genai-core", topic: "Generative AI", difficulty: "Foundational", prompt: "What makes a model generative?", options: ["It can produce new content based on learned patterns", "It never makes mistakes", "It only sorts existing files", "It must be conscious"], answer: 0, explanation: "Generative models create new outputs such as text, images, audio or code. Novel output does not guarantee accuracy or originality." },
  { id: "q16", topicId: "genai-eval", topic: "Generative AI", difficulty: "Applied", prompt: "What is a hallucination in a generative AI response?", options: ["A useful citation", "A confident but unsupported or incorrect output", "A shorter response", "A model update"], answer: 1, explanation: "A hallucination is an output that sounds plausible but is not supported by evidence or is simply false." },
  { id: "q17", topicId: "llm-core", topic: "Large Language Models", difficulty: "Developing", prompt: "What does attention help a transformer do?", options: ["Weigh relationships between tokens in context", "Guarantee the source is true", "Store unlimited conversation", "Avoid using any training data"], answer: 0, explanation: "Attention lets the model calculate which tokens are relevant to one another for the current prediction." },
  { id: "q18", topicId: "llm-inference", topic: "Large Language Models", difficulty: "Applied", prompt: "Increasing temperature during generation generally makes output more…", options: ["Deterministic", "Random and varied", "Fact-checked", "Shorter by definition"], answer: 1, explanation: "Temperature changes the shape of the sampling distribution. Higher values typically allow more varied choices, not more factuality." },
  { id: "q19", topicId: "prompting-core", topic: "Prompting", difficulty: "Foundational", prompt: "Which prompt is most likely to produce a consistent structured answer?", options: ["Tell me something", "Answer well", "Return three risks as JSON with a name and explanation for each", "Do the thing"], answer: 2, explanation: "A clear task, format and constraints reduce ambiguity and make an output easier to validate." },
  { id: "q20", topicId: "prompt-eval", topic: "Prompting", difficulty: "Applied", prompt: "What is a good reason to evaluate a prompt with a small test set?", options: ["One lucky example proves reliability", "It reveals behavior across representative cases", "It removes the need for human review", "It guarantees privacy"], answer: 1, explanation: "A small, representative set helps you see consistency and failure modes instead of relying on a single impressive example." },
  { id: "q21", topicId: "embeddings", topic: "Embeddings & RAG", difficulty: "Developing", prompt: "An embedding is best understood as…", options: ["A numeric representation that can capture relationships", "A database password", "A guaranteed summary", "A replacement for evaluation"], answer: 0, explanation: "Embeddings map items to vectors so related meanings can be compared using a distance or similarity measure." },
  { id: "q22", topicId: "rag", topic: "Embeddings & RAG", difficulty: "Applied", prompt: "What is the main purpose of retrieval-augmented generation?", options: ["Ground a response in retrieved information", "Make every model smaller", "Remove the need for documents", "Prevent all model errors"], answer: 0, explanation: "RAG retrieves relevant sources and supplies them as context so the generator has inspectable evidence to work from." },
  { id: "q23", topicId: "agent-core", topic: "AI Agents", difficulty: "Developing", prompt: "What makes a tool-using AI system different from a single model response?", options: ["It can choose actions and observe results in a loop", "It cannot fail", "It needs no constraints", "It only generates images"], answer: 0, explanation: "An agentic loop combines a model with tools, state and control flow. That extra agency also creates extra reliability and safety considerations." },
  { id: "q24", topicId: "monitoring", topic: "Deployment & MLOps", difficulty: "Applied", prompt: "Why monitor a model after deployment?", options: ["Real-world data and behavior can change", "Training is always complete forever", "Monitoring improves accuracy automatically", "Users never change"], answer: 0, explanation: "Data drift, changing behavior and operational failures can reduce quality after launch, so monitoring keeps those changes visible." },
  { id: "q25", topicId: "fairness", topic: "Responsible AI", difficulty: "Foundational", prompt: "What is a responsible first step when an AI system affects people differently?", options: ["Ignore subgroup outcomes", "Measure outcomes across relevant groups and investigate", "Hide uncertainty", "Deploy faster"], answer: 1, explanation: "Responsible work starts with identifying who is affected, measuring outcomes and investigating disparities with appropriate context." },
  { id: "q26", topicId: "ai-systems", topic: "AI Foundations", difficulty: "Foundational", prompt: "Which set best describes the parts of a working AI system?", options: ["Data, model, objective and feedback", "A screen, keyboard, browser and password", "Only a model and a large dataset", "A prediction with no way to evaluate it"], answer: 0, explanation: "A useful AI system combines examples, a model, a goal that defines success and feedback that reveals errors or uncertainty." },
  { id: "q27", topicId: "responsible-basics", topic: "AI Foundations", difficulty: "Developing", prompt: "What should a team do when an AI system is uncertain or affects people unevenly?", options: ["Hide the uncertainty", "Use human review, inspect relevant groups and investigate errors", "Assume the most fluent output is correct", "Remove evaluation to ship faster"], answer: 1, explanation: "Responsible use keeps uncertainty visible, checks outcomes across relevant groups and gives people a way to review or challenge important decisions." },
];

export const lesson = {
  topicId: "what-is-ai",
  title: "A map of artificial intelligence",
  eyebrow: "AI Foundations · 12 min",
  objectives: ["Separate AI, machine learning and deep learning", "Describe an AI system as data, a model, an objective and feedback", "Name one useful capability and one meaningful limitation"],
  sections: [
    { heading: "Why this matters", body: "AI is discussed as if it were one magical technology. A clear map helps you ask better questions: What is the system trying to do? What examples shaped it? What evidence would show that it works? Those questions remain useful whether you are using a chatbot, evaluating a recommendation system, or building a model yourself." },
    { heading: "The simple explanation", body: "Artificial intelligence is a broad name for systems designed to perform tasks that usually require some form of human judgment, such as recognizing patterns, making predictions, or generating content. Machine learning is one way to build those systems: instead of writing every rule by hand, we give a model examples and let it adjust internal parameters to find useful patterns. Deep learning is machine learning built with many-layered neural networks." },
    { heading: "An everyday analogy", body: "Imagine teaching a friend to sort apples from oranges. You could write a rule about color and shape, but real fruit varies. Or you could show many labeled examples, let your friend notice combinations of clues, and then test the skill on fruit they have not seen. A model follows the second route—but unlike a person, it does not automatically understand why the pattern matters or when the examples stop being representative." },
    { heading: "Inside an AI system", body: "A useful working model has four parts: data supplies examples; a model turns inputs into outputs; an objective defines what counts as better; and feedback reveals where the system is wrong or uncertain. Changing any one of those changes the behavior. More data is not automatically better if it is biased, mislabeled or unrelated to the task." },
    { heading: "Worked example: support-ticket routing", body: "Suppose a company wants to route support tickets to billing, technical support or account access. The inputs might include the ticket text and product area. The model predicts a category. Historical tickets provide training examples, while a held-out set tests generalization. A useful evaluation should examine not only average accuracy but also which types of customers are misrouted and how costly those errors are." },
    { heading: "Common misconceptions", body: "A fluent answer is not proof of understanding. A high benchmark score is not proof that a system works for every context. And a model that learned from data is not free of human choices: people choose the goal, collect the examples, set the threshold and decide what happens when the model is uncertain." },
  ],
  practice: { prompt: "A school uses an AI tool to flag essays for extra review. Name one input, one output, and one piece of evidence you would want before trusting the flag.", hint: "Think about what the system sees, what it predicts, and how you would check whether the prediction is useful and fair.", answer: "A strong answer identifies a relevant input (such as essay text), an output (such as a review flag or risk score), and evidence from representative labeled examples plus subgroup/error analysis." },
};
