from django.shortcuts import render, redirect,  get_object_or_404
from .models import Quiz
from django.views.generic import ListView
from django.http import JsonResponse, HttpResponse
from questions.models import Question, Answer
from results.models import Result
from .forms import CreateUserForm

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

from django.contrib import messages


def register_page(request):
    if request.user.is_authenticated:
        return redirect('quizes:main-view')
    else:
        form = CreateUserForm()
        if request.method == 'POST':
            form = CreateUserForm(request.POST)
            if form.is_valid():
                form.save()
                user = form.cleaned_data.get('username')
                messages.success(request, 'Account was created for ' + user)
                return redirect('quizes:login')

        context = {'form':form}
        return render(request, 'quizes/register.html', context)


def login_page(request):
    if request.user.is_authenticated:
        return redirect('quizes:main-view')
    else:
        if request.method == 'POST':
            username = request.POST.get('username')
            password = request.POST.get('password')

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return redirect('quizes:main-view')
            else:
                messages.info(request, 'Username OR Password is incorrect')

        context = {}
        return render(request, 'quizes/login.html', context)


def logout_user(request):
    logout(request)
    return redirect('quizes:login')


def dash(request):
    context = {}
    return render(request, 'quizes/dashboard.html', context)


def participant(request):
    context = {}
    return render(request, 'quizes/participant.html', context)


class QuizListView(ListView):
    """View for listing all quizzes."""
    model = Quiz
    template_name = 'quizes/main.html'


@login_required(login_url='quizes:login')
def quiz_view(request, pk):
    """View for rendering a specific quiz."""
    quiz = get_object_or_404(Quiz, pk=pk)
    return render(request, 'quizes/quiz.html', {'obj': quiz})


@login_required(login_url='quizes:login')
def quiz_data_view(request, pk):
    quiz = get_object_or_404(Quiz, pk=pk)
    questions = []
    for q in quiz.get_questions():
        answers = []
        for a in q.get_answers():
            answers.append(a.text)
        questions.append({str(q): answers})
    return JsonResponse({
        'data': questions,
        'time': quiz.time,
    })


def is_ajax(request):
    return request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'


@login_required(login_url='quizes:login')
def save_quiz_view(request, pk):
    # if request.is_ajax:
    if is_ajax(request=request):
        questions = []
        data = request.POST
        data_ = dict(data.lists())

        data_.pop('csrfmiddlewaretoken')

        for k in data_.keys():
            print('key: ', k)
            question = Question.objects.get(text=k)
            questions.append(question)
        print(questions)

        user = request.user
        quiz = Quiz.objects.get(pk=pk)

        score = 0
        multiplier = 100 / quiz.no_of_questions
        results = []
        correct_answer = None

        for q in questions:
            a_selected = request.POST.get(q.text)

            if a_selected != "":
                question_answers = Answer.objects.filter(question=q)
                for a in question_answers:
                    if a_selected == a.text:
                        if a.correct:
                            score += 1
                            correct_answer = a.text
                    else:
                        if a.correct:
                            correct_answer = a.text

                results.append({str(q): {'correct_answer': correct_answer, 'answered': a_selected}})
            else:
                results.append({str(q): 'not answered'})

        score_ = score * multiplier
        Result.objects.create(quiz=quiz, user=user, score=score_)

        if score_ >= quiz.pass_mark:
            return JsonResponse({'passed': True, 'score': score_, 'results': results})
        else:
            return JsonResponse({'passed': False, 'score': score_, 'results': results})


