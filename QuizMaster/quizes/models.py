from django.db import models

# Create your models here.
DIFF_LEVEL = {
    ('easy', 'easy'),
    ('medium', 'medium'),
    ('hard', 'hard'),
}


class Quiz(models.Model):
    """
    Model representing a given quiz.

    Fields:
        name (CharField): The name of the quiz.
        topic (CharField): subject of the quiz.
        no of questions: The total no of qns in the quiz.
        time: duration of the quiz
        pass_mark: mark required to pass quiz
    """
    name = models.CharField(max_length=200)
    topic = models.CharField(max_length=200)
    no_of_questions = models.IntegerField()
    time = models.IntegerField(help_text="quiz duration in minutes")
    pass_mark = models.IntegerField(help_text="pass score in %")
    difficulty = models.CharField(max_length=8, choices=DIFF_LEVEL)

    def __str__(self):
        """
        String representation of a quiz.
        """
        return f"{self.name}-{self.topic}"

    def get_questions(self):
        return self.question_set.all()

    class Meta:
        verbose_name_plural = 'Quizes'
