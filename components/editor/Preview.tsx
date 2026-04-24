import { Code } from "bright";
import { MDXRemote } from "next-mdx-remote-client/rsc";

//Setting the theme for code in MDX
Code.theme = {
  light: "github-light",
  dark: "github-dark",
  lightSelector: "html.light",
};

//This component shows MDX
const Preview = ({ content = "" }: { content: string | undefined }) => {
  //Remove back slash\ and HTML space  &#x20; from the content
  const formattedContent = content.replace(/\\/g, "").replace(/&#x20;/g, "");

  return (
    <section className="markdown prose grid break-words">
      <MDXRemote
        source={formattedContent}
        components={{
          pre: (props) => (
            <Code
              {...props}
              lineNumbers
              className="shadow-light-200 dark:shadow-dark-200"
            />
          ),
        }}
      />
    </section>
  );
};

export default Preview;
