import React from 'react';
import './index.css';

interface ElementRotationProps {
    text: string;
}

const Page: React.FC<ElementRotationProps> = (props: ElementRotationProps) => {
    const { text } = props;
    return <div className='rotation'>{text}</div>
}

export default Page;