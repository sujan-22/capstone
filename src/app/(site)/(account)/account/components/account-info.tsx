import React, { useState, useEffect } from "react";
import { Disclosure } from "@headlessui/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MdEdit } from "react-icons/md";
import { IoClose } from "react-icons/io5";

type AccountInfoProps = {
    label: string;
    currentInfo: string | React.ReactNode;
    isSuccess?: boolean;
    isError?: boolean;
    errorMessage?: string;
    clearState: () => void;
    children?: React.ReactNode;
    isLoading?: boolean;
    disabled?: boolean;
};

const AccountInfo = ({
    label,
    currentInfo,
    isSuccess,
    clearState,
    children,
    isLoading,
    disabled,
}: AccountInfoProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        clearState();
        setIsOpen((prev) => !prev);
    };

    useEffect(() => {
        if (isSuccess) {
            setIsOpen(false);
        }
    }, [isSuccess]);

    return (
        <div className="border-b border-rule py-6">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="type-label text-ink-soft">{label}</p>
                    <div className="mt-2 text-[0.9375rem] font-medium">
                        {typeof currentInfo === "string" ? (
                            <span data-testid="current-info">
                                {currentInfo || "Not set"}
                            </span>
                        ) : (
                            currentInfo
                        )}
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 shrink-0 px-4"
                    onClick={handleToggle}
                    type={isOpen ? "reset" : "button"}
                    data-testid="edit-button"
                    data-active={isOpen}
                    aria-expanded={isOpen}
                    icon={isOpen ? IoClose : MdEdit}
                >
                    {isOpen ? "Cancel" : "Edit"}
                </Button>
            </div>

            <Disclosure>
                <Disclosure.Panel
                    static
                    inert={!isOpen}
                    className={cn(
                        "grid transition-[grid-template-rows,opacity] duration-300 ease-out-expo",
                        isOpen
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                    )}
                >
                    <div className="overflow-hidden">
                        <div className="flex flex-col gap-4 pt-5 text-sm sm:flex-row sm:items-start">
                            <div className="w-full space-y-3">{children}</div>
                            <Button
                                className="w-full shrink-0 sm:w-auto"
                                type="submit"
                                isLoading={isLoading}
                                disabled={disabled}
                            >
                                Save changes
                            </Button>
                        </div>
                    </div>
                </Disclosure.Panel>
            </Disclosure>
        </div>
    );
};

export default AccountInfo;
