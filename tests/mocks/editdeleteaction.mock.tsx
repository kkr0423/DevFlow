const MockEditdeleteAction = ({ type }: { type: string; itemId: string }) => {
  return (
    <div>
      <button>Edit {type}</button>
      <button>Delete {type}</button>
    </div>
  );
};

export { MockEditdeleteAction };
