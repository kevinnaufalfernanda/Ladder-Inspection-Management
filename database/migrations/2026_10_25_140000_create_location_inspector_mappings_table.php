<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('location_inspector_mappings', function (Blueprint $table) {
            $table->id();
            $table->string('location_name')->unique();
            $table->foreignId('inspector_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('location_inspector_mappings');
    }
};
