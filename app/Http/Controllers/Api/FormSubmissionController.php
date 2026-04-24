<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreFormSubmissionRequest;
use App\Http\Requests\Api\UpdateFormSubmissionRequest;
use App\Http\Resources\FormSubmissionResource;
use App\Models\FormSubmission;
use App\Models\FormTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
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
        $template = FormTemplate::query()->findOrFail($request->integer('form_template_id'));

        $submission = FormSubmission::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'template_snapshot' => [
                'id' => $template->id,
                'name' => $template->name,
                'structure' => $template->structure,
                'validation_sequence' => $template->validation_sequence,
                'allowed_roles' => $template->allowed_roles,
                'created_by' => $template->created_by,
            ],
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

    public function update(
        UpdateFormSubmissionRequest $request,
        FormSubmission $formSubmission
    ): FormSubmissionResource {
        abort_unless(
            $formSubmission->user_id === $request->user()->id,
            Response::HTTP_FORBIDDEN,
            'You are not allowed to modify this submission.'
        );

        $formSubmission->update($request->validated());

        return FormSubmissionResource::make(
            $formSubmission->fresh()->load(['formTemplate:id,name', 'user:id,name,email'])
        );
    }

    public function destroy(Request $request, FormSubmission $formSubmission): HttpResponse
    {
        abort_unless(
            $formSubmission->user_id === $request->user()->id,
            Response::HTTP_FORBIDDEN,
            'You are not allowed to delete this submission.'
        );

        $formSubmission->delete();

        return response()->noContent();
    }
}
