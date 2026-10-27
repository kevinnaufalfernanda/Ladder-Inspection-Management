<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('admin', 'inspector', 'pic_safety') NOT NULL DEFAULT 'pic_safety'");
        }

        Schema::table('ladders', function (Blueprint $table) {
            $table->string('owner_name')->nullable()->after('location');
            $table->string('responsible_name')->nullable()->after('owner_name');
            $table->decimal('max_load', 8, 2)->nullable()->after('responsible_name');
            $table->foreignId('inspector_id')->nullable()->after('max_load')->constrained('users')->nullOnDelete();
            $table->string('identifier')->nullable()->unique()->after('inspector_id');
        });

        Schema::table('inspections', function (Blueprint $table) {
            $table->foreignId('submitted_by_id')->nullable()->after('inspector_id')->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by_id')->nullable()->after('submitted_by_id')->constrained('users')->nullOnDelete();
            $table->string('workflow_status')->default('pending_review')->after('status');
            $table->json('review_data')->nullable()->after('checklist');
            $table->text('review_comment')->nullable()->after('notes');
            $table->timestamp('approved_at')->nullable()->after('review_comment');
        });
    }

    public function down(): void
    {
        Schema::table('inspections', function (Blueprint $table) {
            $table->dropForeign(['submitted_by_id']);
            $table->dropForeign(['reviewed_by_id']);
            $table->dropColumn(['submitted_by_id', 'reviewed_by_id', 'workflow_status', 'review_data', 'review_comment', 'approved_at']);
        });

        Schema::table('ladders', function (Blueprint $table) {
            $table->dropForeign(['inspector_id']);
            $table->dropUnique(['identifier']);
            $table->dropColumn(['owner_name', 'responsible_name', 'max_load', 'inspector_id', 'identifier']);
        });

        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('admin', 'inspector') NOT NULL DEFAULT 'inspector'");
        }
    }
};