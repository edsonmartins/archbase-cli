// Component with intentional problems for validation testing
import { ArchbaseEdit } from '@archbase/react';

const ProblemComponent = (props) => {
  const handleSubmit = () => {
    console.log('Submit');
  };

  if (props.condition) {
    if (props.nested) {
      if (props.deepNested) {
        return <div>Deep nesting</div>;
      }
    }
  }

  return (
    <div>
      <ArchbaseEdit value={props.value} />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};