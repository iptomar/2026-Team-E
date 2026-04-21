<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreFormSubmissionRequest;
use App\Http\Resources\FormSubmissionResource;
use App\Models\FormSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FormSubmissionController extends Controller
{
    public function index(Request $request)
    {
        $submissions = FormSubmission::query()
            ->with(['formTemplate:id,name', 'user:id,name,email'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return FormSubmissionResource::collection($submissions);
    }

    public function store(StoreFormSubmissionRequest $request): JsonResponse
    {
        $submission = FormSubmission::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ])->load(['formTemplate:id,name', 'user:id,name,email']);

        return FormSubmissionResource::make($submission)
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Request $request, FormSubmission $formSubmission): FormSubmissionResource
    {
        abort_unless(
            $formSubmission->user_id === $request->user()->id,
            Response::HTTP_FORBIDDEN,
            'You are not allowed to view this submission.'
        );

        return FormSubmissionResource::make(
            $formSubmission->load(['formTemplate:id,name', 'user:id,name,email'])
        );
    }
}
