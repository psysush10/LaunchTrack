interface FormInputProps {
  type?: string,
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

export default function FormInput({
    type,
    placeholder,
    value,
    onChange
} : FormInputProps){
    return (
        <input
        type={type || "text"}
        placeholder={placeholder}
        value={value}
        onChange={(e)=>{onChange(e.target.value) 
        }}
        className="border p-2 block mb-4"
      />
    )
}