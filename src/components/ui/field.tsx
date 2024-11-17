import { Field as ChakraField, FieldErrorText, Text } from '@chakra-ui/react';
import { forwardRef } from 'react';

export interface FieldProps extends Omit<ChakraField.RootProps, 'label'> {
	label?: React.ReactNode;
	helperText?: React.ReactNode;
	errorText?: React.ReactNode;
	optionalText?: React.ReactNode;
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(props, ref) {
	const { label, children, helperText, errorText, optionalText, ...rest } = props;
	return (
		<ChakraField.Root
			ref={ref}
			{...rest}
		>
			{label && (
				<ChakraField.Label fontSize={{ base: 'xl' }}>
					{label}
					<ChakraField.RequiredIndicator fallback={optionalText} />
				</ChakraField.Label>
			)}
			{children}
			{helperText && <ChakraField.HelperText>{helperText}</ChakraField.HelperText>}
			{errorText && <Text color={'red'}>{errorText}</Text>}
		</ChakraField.Root>
	);
});
