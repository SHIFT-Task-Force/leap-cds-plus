CREATE TABLE IF NOT EXISTS "confidentiality_rules" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"basis_system" varchar(255) NOT NULL,
	"basis_code" varchar(255) NOT NULL,
	"basis_display" varchar(255) NOT NULL,
	"labels" jsonb NOT NULL,
	"codes" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sensitivity_rules" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"basis_system" varchar(255) NOT NULL,
	"basis_code" varchar(255) NOT NULL,
	"basis_display" varchar(255) NOT NULL,
	"labels" jsonb NOT NULL,
	"code_sets" jsonb NOT NULL
);
