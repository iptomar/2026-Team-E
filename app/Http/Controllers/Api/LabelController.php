<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Label;
class LabelController extends Controller
{
    public function index()
    {
        // Retorna as labels para o React Flow
        return response()->json(Label::all(['id', 'name']));
    }
}
