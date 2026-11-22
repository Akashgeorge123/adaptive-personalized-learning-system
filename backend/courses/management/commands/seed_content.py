
from decimal import Decimal
from urllib.parse import quote_plus

from django.core.management.base import BaseCommand, CommandError

from accounts.models import Admin
from courses.models import Course, Topic, LearningResource
from assessments.models import Assessment, Question, AnswerOption


# Each question: question text, four options, correct option index, difficulty

COURSE_DATA = [
    {
        "title": "Python Programming",
        "description": "Learn Python programming from fundamentals to advanced concepts.",
        "level": "Beginner",
        "topics": [
            ("Python Basics", "Introduction to Python syntax, variables and data types."),
            ("Control Flow", "Conditional statements, loops and decision making."),
            ("Functions", "Functions, parameters, arguments and return values."),
            ("Object Oriented Programming", "Classes, objects, inheritance and encapsulation."),
            ("File Handling", "Reading, writing and managing files in Python."),
        ],
        "questions": [
            ("Which keyword defines a function in Python?", ["function", "def", "define", "func"], 1, "easy"),
            ("Which symbol starts a comment in Python?", ["//", "#", "/*", "--"], 1, "easy"),
            ("Which data type stores True or False?", ["int", "str", "bool", "list"], 2, "easy"),
            ("Which function displays output in Python?", ["input()", "print()", "display()", "output()"], 1, "easy"),
            ("Which collection stores ordered, mutable elements?", ["tuple", "set", "list", "frozenset"], 2, "easy"),
            ("Which keyword handles an alternative condition?", ["elseif", "else", "otherwise", "default"], 1, "easy"),
            ("Which loop iterates over a sequence?", ["repeat", "foreach", "for", "loop"], 2, "easy"),
            ("What does range(5) generate?", ["1 to 5", "0 to 4", "0 to 5", "1 to 4"], 1, "easy"),
            ("Which keyword creates a class?", ["object", "class", "struct", "new"], 1, "medium"),
            ("Which method reads the entire contents of a file?", ["read()", "write()", "close()", "openall()"], 0, "medium"),
        ],
    },
    {
        "title": "Java Programming",
        "description": "Understand Java syntax, object-oriented programming and application development.",
        "level": "Beginner",
        "topics": [
            ("Java Basics", "Introduction to Java syntax, variables and data types."),
            ("Control Statements", "Conditional statements and looping constructs."),
            ("Methods and Arrays", "Methods, parameters, arrays and method overloading."),
            ("Object Oriented Java", "Classes, objects, inheritance and polymorphism."),
            ("Exception Handling", "Handling runtime errors using Java exceptions."),
        ],
        "questions": [
            ("Which method is the entry point of a Java application?", ["start()", "main()", "run()", "init()"], 1, "easy"),
            ("Which keyword declares a class in Java?", ["define", "class", "struct", "object"], 1, "easy"),
            ("Which data type stores whole numbers?", ["float", "boolean", "int", "char"], 2, "easy"),
            ("Which symbol terminates a Java statement?", [":", ".", ";", ","], 2, "easy"),
            ("Which keyword creates an object?", ["class", "new", "this", "object"], 1, "easy"),
            ("Which keyword is used for inheritance in Java?", ["implements", "extends", "inherits", "superclass"], 1, "easy"),
            ("Which loop executes at least once?", ["for", "while", "do-while", "foreach"], 2, "medium"),
            ("Which keyword refers to the current object?", ["super", "this", "self", "current"], 1, "medium"),
            ("Which block handles an exception?", ["try", "catch", "finally", "throw"], 1, "medium"),
            ("Which keyword prevents a method from being overridden?", ["static", "final", "private", "abstract"], 1, "medium"),
        ],
    },
    {
        "title": "Database Management Systems",
        "description": "Learn relational databases, SQL, normalization and transaction management.",
        "level": "Beginner",
        "topics": [
            ("Database Fundamentals", "Database concepts, tables and relational models."),
            ("SQL Basics", "SQL commands and basic queries."),
            ("Keys and Constraints", "Primary keys, foreign keys and database constraints."),
            ("Normalization", "Database normalization and normal forms."),
            ("Transactions", "Transaction properties and concurrency control."),
        ],
        "questions": [
            ("What does DBMS stand for?", ["Data Backup Management System", "Database Management System", "Digital Base Management Software", "Database Mapping System"], 1, "easy"),
            ("Which structure stores data in a relational database?", ["Graph", "Table", "Stack", "Queue"], 1, "easy"),
            ("Which SQL command retrieves data?", ["GET", "FETCH", "SELECT", "OPEN"], 2, "easy"),
            ("Which SQL command adds new records?", ["INSERT", "UPDATE", "ALTER", "CREATE"], 0, "easy"),
            ("What uniquely identifies a row in a table?", ["Foreign key", "Primary key", "Index", "View"], 1, "easy"),
            ("Which key references another table's primary key?", ["Candidate key", "Foreign key", "Composite key", "Super key"], 1, "easy"),
            ("What is the main purpose of normalization?", ["Increase duplication", "Reduce redundancy", "Delete records", "Encrypt tables"], 1, "medium"),
            ("Which normal form removes partial dependencies?", ["1NF", "2NF", "3NF", "BCNF"], 1, "medium"),
            ("What does ACID describe?", ["Database security", "Transaction properties", "Query syntax", "Data types"], 1, "medium"),
            ("Which SQL command removes a table structure?", ["DELETE", "REMOVE", "DROP", "CLEAR"], 2, "medium"),
        ],
    },
    {
        "title": "Data Structures and Algorithms",
        "description": "Study essential data structures, algorithms and problem-solving techniques.",
        "level": "Beginner",
        "topics": [
            ("Arrays and Strings", "Array operations and string manipulation."),
            ("Linked Lists", "Singly and doubly linked lists."),
            ("Stacks and Queues", "Linear data structures and their operations."),
            ("Searching and Sorting", "Common searching and sorting algorithms."),
            ("Trees and Graphs", "Tree structures, graph traversal and representations."),
        ],
        "questions": [
            ("Which data structure stores elements in indexed positions?", ["Stack", "Array", "Tree", "Graph"], 1, "easy"),
            ("What is the first index of a typical Python list?", ["1", "-1", "0", "2"], 2, "easy"),
            ("What does a linked list consist of?", ["Only arrays", "Nodes and links", "Only indexes", "Rows and columns"], 1, "easy"),
            ("Which principle does a stack follow?", ["FIFO", "LIFO", "FILO only", "Random"], 1, "easy"),
            ("Which principle does a queue follow?", ["LIFO", "FIFO", "Random", "Binary"], 1, "easy"),
            ("Which operation adds an element to a stack?", ["Enqueue", "Push", "Dequeue", "Search"], 1, "easy"),
            ("Which search algorithm requires sorted data?", ["Linear search", "Binary search", "Sequential search", "Random search"], 1, "medium"),
            ("What is the average time complexity of merge sort?", ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], 1, "medium"),
            ("Which data structure is used in BFS?", ["Stack", "Queue", "Heap", "Array only"], 1, "medium"),
            ("A tree with each node having at most two children is called?", ["AVL tree", "Binary tree", "B-tree", "Graph"], 1, "easy"),
        ],
    },
    {
        "title": "Web Development",
        "description": "Learn frontend and backend web development technologies.",
        "level": "Beginner",
        "topics": [
            ("HTML Fundamentals", "HTML elements, attributes and document structure."),
            ("CSS Styling", "Selectors, layouts, colours and responsive styling."),
            ("JavaScript Basics", "Variables, functions, arrays and events."),
            ("React Fundamentals", "Components, props, state and hooks."),
            ("Web APIs", "HTTP requests, REST APIs and JSON data."),
        ],
        "questions": [
            ("What does HTML stand for?", ["Hyper Text Markup Language", "High Transfer Machine Language", "Hyper Tool Multi Language", "Home Text Management Language"], 0, "easy"),
            ("Which HTML element creates a hyperlink?", ["<link>", "<a>", "<href>", "<url>"], 1, "easy"),
            ("Which HTML element displays an image?", ["<image>", "<picture>", "<img>", "<src>"], 2, "easy"),
            ("What does CSS control?", ["Database storage", "Webpage presentation", "Server routing", "Network protocols"], 1, "easy"),
            ("Which CSS property changes text colour?", ["font-style", "background", "color", "text-size"], 2, "easy"),
            ("Which keyword declares a block-scoped variable in JavaScript?", ["var", "let", "define", "dim"], 1, "easy"),
            ("Which method converts JSON text into a JavaScript object?", ["JSON.parse()", "JSON.stringify()", "JSON.convert()", "JSON.object()"], 0, "medium"),
            ("What is a React component?", ["A database", "A reusable UI building block", "A CSS property", "A browser"], 1, "easy"),
            ("Which React hook manages component state?", ["useEffect", "useState", "useRoute", "useFetch"], 1, "easy"),
            ("Which HTTP method is commonly used to retrieve data?", ["POST", "DELETE", "GET", "PATCH"], 2, "easy"),
        ],
    },
    {
        "title": "Machine Learning",
        "description": "Explore machine learning concepts, algorithms and model evaluation.",
        "level": "Beginner",
        "topics": [
            ("ML Fundamentals", "Introduction to machine learning and its types."),
            ("Data Preprocessing", "Cleaning, transforming and preparing datasets."),
            ("Supervised Learning", "Classification and regression algorithms."),
            ("Unsupervised Learning", "Clustering and dimensionality reduction."),
            ("Model Evaluation", "Training, testing and performance metrics."),
        ],
        "questions": [
            ("What is machine learning?", ["A database system", "A method for systems to learn patterns from data", "A programming language", "A network protocol"], 1, "easy"),
            ("Which is a type of machine learning?", ["Supervised learning", "Markup learning", "Static learning", "Manual learning"], 0, "easy"),
            ("What is a labelled dataset used for?", ["Supervised learning", "File compression", "Encryption", "Rendering"], 0, "easy"),
            ("Which task predicts a continuous numerical value?", ["Classification", "Regression", "Clustering", "Sorting"], 1, "easy"),
            ("Which task assigns data to categories?", ["Regression", "Classification", "Normalization", "Compression"], 1, "easy"),
            ("What is the purpose of data preprocessing?", ["Make data unusable", "Prepare data for analysis and modelling", "Delete all features", "Replace the model"], 1, "easy"),
            ("Which algorithm is commonly used for clustering?", ["K-means", "Linear regression", "Decision tree", "Naive Bayes"], 0, "medium"),
            ("Why is a dataset split into training and testing sets?", ["To increase file size", "To evaluate performance on unseen data", "To remove labels", "To duplicate records"], 1, "medium"),
            ("What does overfitting mean?", ["Model performs poorly on training data", "Model memorizes training patterns and generalizes poorly", "Model has no parameters", "Model has no training data"], 1, "medium"),
            ("Which metric measures the proportion of correct predictions?", ["Accuracy", "Recall", "Mean squared error", "Latency"], 0, "easy"),
        ],
    },
]


class Command(BaseCommand):
    help = "Populate the adaptive learning project with sample educational content."

    def handle(self, *args, **options):

        try:
            admin = Admin.objects.get(admin_id=1)
        except Admin.DoesNotExist:
            raise CommandError("Admin ID 1 was not found.")

        # Reuse the existing Python and Java courses.
        existing_course_ids = {
            "Python Programming": 3,
            "Java Programming": 4,
        }

        for course_data in COURSE_DATA:

            title = course_data["title"]

            if title in existing_course_ids:
                try:
                    course = Course.objects.get(
                        course_id=existing_course_ids[title]
                    )
                except Course.DoesNotExist:
                    raise CommandError(
                        f"Expected existing course ID "
                        f"{existing_course_ids[title]} for {title}."
                    )

                if course.title != title:
                    raise CommandError(
                        f"Course ID {course.course_id} does not match {title}."
                    )

            else:
                course, _ = Course.objects.get_or_create(
                    title=title,
                    defaults={
                        "description": course_data["description"],
                        "level": course_data["level"],
                        "admin": admin,
                    },
                )

            self.stdout.write(f"\nCourse: {course.title}")

            # Create topics.
            topics = []

            for index, topic_data in enumerate(course_data["topics"], start=1):

                topic_title, description = topic_data

                topic, _ = Topic.objects.get_or_create(
                    course=course,
                    title=topic_title,
                    defaults={
                        "description": description,
                        "sequence_number": index,
                    },
                )

                topics.append(topic)

            # Add one video-search resource for every topic.
            for topic in topics:

                resource_title = f"Video lessons: {topic.title}"

                search_query = quote_plus(
                    f"{course.title} {topic.title} tutorial"
                )

                LearningResource.objects.get_or_create(
                    topic=topic,
                    title=resource_title,
                    defaults={
                        "resource_type": "video",
                        "url": (
                            "https://www.youtube.com/results?search_query="
                            + search_query
                        ),
                    },
                )

            # Two assessments, five questions each.
            question_bank = course_data["questions"]

            for assessment_index in range(2):

                assessment_title = (
                    f"{course.title} - "
                    f"{'Fundamentals Quiz' if assessment_index == 0 else 'Advanced Quiz'}"
                )

                assessment, _ = Assessment.objects.get_or_create(
                    course=course,
                    title=assessment_title,
                    defaults={
                        "type": "quiz",
                        "total_marks": Decimal("20.00"),
                    },
                )

                # Reuse the existing Python Basics Quiz for course ID 3.
                if (
                    course.title == "Python Programming"
                    and assessment_index == 0
                ):
                    assessment = Assessment.objects.get_or_create(
                        course=course,
                        title="Python Basics Quiz",
                        defaults={
                            "type": "quiz",
                            "total_marks": Decimal("20.00"),
                        },
                    )[0]

                bank = question_bank[
                    assessment_index * 5:(assessment_index + 1) * 5
                ]

                existing_questions = list(
                    Question.objects.filter(assessment=assessment)
                )

                existing_texts = {
                    question.question_text
                    for question in existing_questions
                }

                missing = [
                    item for item in bank
                    if item[0] not in existing_texts
                ]

                slots = max(0, 5 - len(existing_questions))
                missing = missing[:slots]

                current_marks = sum(
                    (question.marks for question in existing_questions),
                    Decimal("0.00"),
                )

                remaining_marks = (
                    Decimal(assessment.total_marks) - current_marks
                )

                if remaining_marks < 0:
                    raise CommandError(
                        f"Existing question marks exceed total marks "
                        f"for {assessment.title}."
                    )

                if missing and slots:
                    mark_per_question = (
                        remaining_marks / len(missing)
                    ).quantize(Decimal("0.01"))

                    for index, item in enumerate(missing):

                        question_text, option_texts, correct_index, difficulty = item

                        # Put any rounding remainder into the final question.
                        if index == len(missing) - 1:
                            marks = remaining_marks
                        else:
                            marks = mark_per_question

                        question = Question.objects.create(
                            assessment=assessment,
                            question_text=question_text,
                            marks=marks,
                            difficulty=difficulty,
                        )

                        remaining_marks -= marks

                        existing_questions.append(question)

                # Ensure every question has its four options.
                for question in existing_questions:

                    bank_item = next(
                        (
                            item for item in bank
                            if item[0] == question.question_text
                        ),
                        None,
                    )

                    if bank_item is None:
                        continue

                    _, option_texts, correct_index, _ = bank_item

                    for option_index, option_text in enumerate(option_texts):

                        AnswerOption.objects.get_or_create(
                            question=question,
                            option_text=option_text,
                            defaults={
                                "is_correct": (
                                    option_index == correct_index
                                ),
                            },
                        )

                self.stdout.write(
                    f"  Assessment: {assessment.title}"
                )

        self.stdout.write(
            self.style.SUCCESS(
                "\nDatabase seeding completed successfully!"
            )
        )
