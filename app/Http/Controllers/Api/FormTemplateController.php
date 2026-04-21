<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreFormTemplateRequest;
use App\Http\Requests\Api\UpdateFormTemplateRequest;
use App\Http\Resources\FormTemplateResource;
use App\Models\FormTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Symfony\Component\HttpFoundation\Response;

class FormTemplateController extends Controller
{
    public function index(Request $request)
    {
        $templates = FormTemplate::query()
            ->with('creator:id,name,email')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return FormTemplateResource::collection($templates);
    }

    public function store(StoreFormTemplateRequest $request): JsonResponse
    {
        $template = FormTemplate::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ])->load('creator:id,name,email');

        return FormTemplateResource::make($template)
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(FormTemplate $formTemplate): FormTemplateResource
    {
        return FormTemplateResource::make(
            $formTemplate->load('creator:id,name,email')
        );
    }

    public function update(UpdateFormTemplateRequest $request, FormTemplate $formTemplate): FormTemplateResource
    {
        abort_unless(
            $formTemplate->created_by === $request->user()->id,
            Response::HTTP_FORBIDDEN,
            'You are not allowed to modify this template.'
        );

        $formTemplate->update($request->validated());

        return FormTemplateResource::make(
            $formTemplate->fresh()->load('creator:id,name,email')
        );
    }

    public function destroy(Request $request, FormTemplate $formTemplate): HttpResponse
    {
        abort_unless(
            $formTemplate->created_by === $request->user()->id,
            Response::HTTP_FORBIDDEN,
            'You are not allowed to delete this template.'
        );

        $formTemplate->delete();

        return response()->noContent();
    }
}
