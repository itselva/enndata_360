export const selectCustomStyles = {
    control: (provided) => ({
        ...provided,
        minHeight: '36px',
        height: '36px',
        width: '180px',
        border: '1px solid #ccc', // Add your border color
        borderRadius: '8px', // Add your border radius
        backgroundColor: 'white',
        fontSize: '15px'
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: '0 6px',
    }),
    input: (provided) => ({
        ...provided,
        margin: '0px',
    }),
    indicatorSeparator: () => ({
        display: 'none',
        backgroundColor: "#EFF4FB"
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        height: '33px',
        // backgroundColor: "#EFF4FB",
        borderRadius: '0px 5px 5px 0px',
    }),
    multiValue: (provided) => ({
        ...provided,
        maxWidth: '120px',
        backgroundColor: 'transparent'

    }),
    option: (provided, state) => ({
        ...provided,
        fontSize: '15px',
         padding:'4px 10px',
        backgroundColor: state.isSelected
            ? '#3AAED5' : 'transparent',
        '&:hover': {
            backgroundColor: '#3AAED5', // Red when hovered
            color: 'white', // White text on hover
        },
    }),
    menu: (provided) => ({
        ...provided,
        width: '180px', // Set the dropdown (menu) width here
        zIndex: 9999,
    }),
    // menuList:(provided)=>({
    //     ...provided,
    //     padding:'5px 10px'
    // })

}

export const selectCustomStylesFilter = {
   control: (provided) => ({
        ...provided,
        minHeight: '30px',
        height: '30px',
        width: '160px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: 'white',
        fontSize: '14px',
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: '0 6px',
        height: '30px',
    }),
    input: (provided) => ({
        ...provided,
        margin: '0px',
        padding: 0,
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        height: '28px',
        borderRadius: '0px 5px 5px 0px',
    }),
    multiValue: (provided) => ({
        ...provided,
        maxWidth: '110px', // Slightly narrower for 150px control
        backgroundColor: 'transparent',
        fontSize: '13px',
    }),
    option: (provided, state) => ({
        ...provided,
        fontSize: '14px',
        padding: '4px 8px',
        backgroundColor: state.isSelected ? '#3AAED5' : 'transparent',
        color: state.isSelected ? 'white' : 'black',
        '&:hover': {
            backgroundColor: '#3AAED5',
            color: 'white',
        },
    }),
    menu: (provided) => ({
        ...provided,
        width: '160px',
        zIndex: 9999,
    }),
};


export const selectCustomStylesRevert = {
    control: (provided, state) => ({
        ...provided,
        minHeight: '36px',
        height: 'auto',               // Important: allow height to grow
        width: '300px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: 'white',
        fontSize: '15px',
        flexWrap: 'wrap',             // Allow multi-line display
        boxSizing: 'border-box',
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: '0 6px',
        flexWrap: 'wrap',             // Allow chips to wrap
        alignItems: 'center',
        maxHeight: '72px',            // Limit height
        overflowY: 'auto',            // Scroll when too many values
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: 'transparent',
        maxWidth: '100px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }),
    input: (provided) => ({
        ...provided,
        margin: '0px',
        //  backgroundColor: "#EFF4FB"
    }),
    indicatorSeparator: () => ({
        display: 'none',
        backgroundColor: "#EFF4FB"
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        height: '33px',
        // backgroundColor: "#EFF4FB",
        borderRadius: '0px 5px 5px 0px',
    }),
    option: (provided, state) => ({
        ...provided,
        fontSize: '15px',
        backgroundColor: state.isSelected
            ? '#3AAED5' : 'transparent',
        '&:hover': {
            backgroundColor: '#3AAED5', // Red when hovered
            color: 'white', // White text on hover
        },
    }),
    menu: (provided) => ({
        ...provided,
        width: '300px', // Set the dropdown (menu) width here
        zIndex: 9999,
        padding:'5px 10px'
    }),


}
