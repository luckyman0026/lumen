"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type PaginationState, PAGE_SIZE_OPTIONS } from "@/lib/table-utils";
import {
	ArrowLeft01Icon,
	ArrowLeftDoubleIcon,
	ArrowRight01Icon,
	ArrowRightDoubleIcon,
	Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface TableSearchProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export function TableSearch({
	value,
	onChange,
	placeholder = "Search...",
}: TableSearchProps) {
	return (
		<div className="relative">
			<HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
			<Input
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="pl-9 h-10 w-[250px]"
			/>
		</div>
	);
}

interface TablePaginationProps {
	pagination: PaginationState;
	onPageChange: (page: number) => void;
	onPageSizeChange: (size: number) => void;
	canGoNext: boolean;
	canGoPrev: boolean;
}

export function TablePagination({
	pagination,
	onPageChange,
	onPageSizeChange,
	canGoNext,
	canGoPrev,
}: TablePaginationProps) {
	const { page, pageSize, totalItems, totalPages } = pagination;
	const startItem = (page - 1) * pageSize + 1;
	const endItem = Math.min(page * pageSize, totalItems);

	return (
		<div className="flex items-center justify-between gap-4 pt-4">
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<span>Rows per page:</span>
				<Select
					value={pageSize.toString()}
					onValueChange={(value) => onPageSizeChange(Number(value))}
				>
					<SelectTrigger className="h-8 w-[70px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{PAGE_SIZE_OPTIONS.map((size) => (
							<SelectItem key={size} value={size.toString()}>
								{size}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">
					{startItem}-{endItem} of {totalItems}
				</span>

				<div className="flex items-center gap-1">
					<Button
						variant="outline"
						size="icon"
						className="size-8"
						onClick={() => onPageChange(1)}
						disabled={!canGoPrev}
					>
						<HugeiconsIcon icon={ArrowLeftDoubleIcon} className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="size-8"
						onClick={() => onPageChange(page - 1)}
						disabled={!canGoPrev}
					>
						<HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
					</Button>
					<span className="text-sm px-2 min-w-[80px] text-center">
						Page {page} of {totalPages}
					</span>
					<Button
						variant="outline"
						size="icon"
						className="size-8"
						onClick={() => onPageChange(page + 1)}
						disabled={!canGoNext}
					>
						<HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="size-8"
						onClick={() => onPageChange(totalPages)}
						disabled={!canGoNext}
					>
						<HugeiconsIcon icon={ArrowRightDoubleIcon} className="size-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}

interface TableToolbarProps {
	children?: React.ReactNode;
}

export function TableToolbar({ children }: TableToolbarProps) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3 mb-4">
			{children}
		</div>
	);
}
