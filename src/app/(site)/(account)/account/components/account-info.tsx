import React, { useState, useEffect } from "react";
import { Disclosure } from "@headlessui/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
        <div className="text-sm">
            <div className="flex items-end justify-between">
                <div className="flex flex-col">
                    <span className="text-md">{label}</span>
                    <div className="flex items-center flex-1 basis-0 gap-x-4 text-muted-foreground">
                        {typeof currentInfo === "string" ? (
                            <span data-testid="current-info">
                                {currentInfo}
                            </span>
                        ) : (
                            currentInfo
                        )}
                    </div>
                </div>
                <div className="mb-auto">
                    <Button
                        variant="outline"
                        className="w-[100px] min-h-[25px] py-1"
                        onClick={handleToggle}
                        type={isOpen ? "reset" : "button"}
                        data-testid="edit-button"
                        data-active={isOpen}
                    >
                        {isOpen ? "Cancel" : "Edit"}
                    </Button>
                </div>
            </div>

            <Disclosure>
                <Disclosure.Panel
                    static
                    className={cn(
                        "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
                        {
                            "max-h-[1000px] opacity-100": isOpen,
                            "max-h-0 opacity-0": !isOpen,
                        }
                    )}
                >
                    <div className="lg:flex flex-wrap gap-x-4 py-4 sm:block sm:flex-nowrap ">
                        <div className="w-full sm:space-y-2">{children}</div>
                        <Button
                            className="w-full sm:w-auto sm:mt-4 mt-4 lg:mt-auto sm:ml-auto"
                            type="submit"
                            isLoading={isLoading}
                            disabled={disabled}
                        >
                            Save changes
                        </Button>
                    </div>
                </Disclosure.Panel>
            </Disclosure>
        </div>
    );
};

export default AccountInfo;
