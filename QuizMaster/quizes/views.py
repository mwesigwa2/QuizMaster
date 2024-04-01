from django.shortcuts import render,  get_object_or_404
from .models import Quiz
from django.views.generic import ListView


class QuizListView(ListView):
    """View for listing all quizzes."""
    model = Quiz
    template_name = 'quizes/main.html'


def quiz_view(request, pk):
    """View for rendering a specific quiz."""
    quiz = get_object_or_404(Quiz, pk=pk)
    return render(request, 'quizes/quiz.html', {'obj': quiz})
