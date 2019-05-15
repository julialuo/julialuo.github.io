# CS 184 Final Project Report

# Abstract

Given a source and target video of the faces of two individual actors, our project synthesizes a convincing, photo-realistic re-animation of the target actor using the source actor’s 3D head position, rotation, and face expression. To do this, we first fit a statistical model of a face onto each of the videos using the monocular face reconstruction algorithm. Then, we build a 3D morphable mesh, combining the features of the two faces together, and rasterize this mesh for all frames of the source video in our conditioning input synthesis step. Finally, we use a Generative Adversarial Network to convert this rasterized video into our final photo-realistic video resembling the target video in our rendering-to-video translation step.

# Technical Approach 
## Monocular Face Reconstruction

We were able to successfully fit a 3D morphable model to facial images within videos. For an overview of the method, we refer to our [project proposal](http://juliazluo.me/deep-puppets/). We use the 2009 Basel Face model [1] to extract the facial shape bases, and combined that with the expression bases from Cao *et al*’s FaceWarehouse [2]. The expression bases were transferred onto the Basel topology using Deformation transfer [3].

Using Gauss-Newton Project-Out Optimization as suggested by Booth *****et al* [4], we find first-order Taylor approximations to the cost function with respect to small changes in the identity vector $$\mathbf{p}$$, the expression vector $$\mathbf{q}$$, and the camera vector $$\mathbf{c}$$ for each frame of the video. As a result of the linearization, we can solve a least-squares problem for the concatenated vector $$\Delta \mathbf{b}^T = [\Delta \mathbf{p}^T \quad \Delta \mathbf{q}^T \quad \Delta\mathbf{c}^T ]$$ minimizing loss. Additionally, we enforce temporal smoothing across frames for $$\mathbf{q}_i, \mathbf{c}_i$$ and  by penalizing their second derivatives with respect to time, $$||\mathbf{q}_{i - 1} - \mathbf{q}_i + \mathbf{q}_{i + 1}||^2, ||\mathbf{c}_{i - 1} - \mathbf{c}_i + \mathbf{c}_{i + 1}||^2$$. While baseline implementations for optimizing and expression smoothing were provided by [4], we additionally implemented camera smoothing. We also used Tran et al’s [5] CNN for regressing texture on the first frame of the video — the fitted texture parameter $$\mathbf{t}$$ is used for the remainder of the frames of the video.

The face-fitting algorithm required quadratic memory complexity, which meant that we had to wait on the order of forever when creating the rasterized frames for longer videos. To “fix” this, we broke up the video into segments and performed the fitting on segments. While smoothness constraints were not imposed across segments, the overall result was still acceptable. We also noticed that the face jittered a lot translationally and rotationally after fitting, which resulted in worse quality training data for our subsequent GAN. We fixed this by adding a penalty to changes in the camera parameters. 

## Conditioning Input Synthesis

Using our monocular face reconstruction procedure, we parameterize the face in each frame of both the source and target video in terms of our 3D morphable model of expression, identity, and pose. Given the source and target face parameters, we can transfer expression and pose from source to target by copying over the parameters in a relative manner. Then we render conditioning images of the target actor’s face using the modified parameters to synthesize and rasterize a morphable model mesh. These images are used as input to our rendering-to-video translation network.

Specifically, for temporal coherence, to generate the $$k$$-th frame of our output, we stack the current conditioning image with the last $$L$$ rasterized conditioning images $$\{ \mathbf{s_{k-i}} \vert i=0,1,...,L \}$$ and use this $$H \times W \times 3L$$ (3 channels for each image, and $$L$$ images in our sliding window) tensor $$\mathbf{X}$$ as input. 

## Rendering-to-Video Translation

After obtaining the video frames of our rasterized mesh, we convert these video frames into our final output video frames using Nvidia’s video-to-video synthesis neural network architecture$$^6$$. Specifically, given our sequence of $$T$$ input frames $$\mathbf{s_1^T} = \{\mathbf{s_1}, \ldots, \mathbf{s_T}\}$$ and a sequence of $$T$$ target video frames $$\mathbf{x_1^T} = \{\mathbf{x_1}, \ldots, \mathbf{x_T}\}$$, we output reconstructed video frames $$\mathbf{x_1^{T\prime}} = \{\mathbf{x_1^\prime}, \ldots, \mathbf{x_T^\prime}\}$$ such that $$\Pr(\mathbf{x_1^{T\prime}} \vert \mathbf{s_1^T}) = \Pr(\mathbf{x_1^T} \vert \mathbf{s_1^T})$$.

Here, vid2vid uses a conditional Generative Adversarial Network with a single generator $$G$$ and two conditional discriminators $$D_I$$ and $$D_V$$. The generator $$G$$ produces sequential video frames with a Markov assumption where the current video frame depends on only the past $$L$$ video frames (they ultimately set $$L=2$$ for their experiments). The discriminator $$D_I$$ ensures that that our reconstructed video resembles the target video and thus discriminates between image frames in our reconstructed video and those in the original target video (i.e. it outputs 0 for “fake” video frames and 1 for “real” video frames). The discriminator $$D_V$$ ensures that our reconstructed video has similar temporal dynamics as the original video and discriminates between consecutive frames of the reconstructed video and those of the original video given the optical flow for the past $$K$$ frames of the original video. Then, they train to minimize the GAN loss for each discriminator, $$\max_D~\min_G~\mathbf{E}_{\mathbf{x_1^T}, \mathbf{s_1^T}} [\log D(\mathbf{x_1^T}, \mathbf{s_1^T})] + \mathbf{E}_{\mathbf{s_1^T}} [\log(1-D(G(\mathbf{s_1^T}), \mathbf{s_1^T})]$$ and find the generator the minimizes the sum of the both discriminator losses as well as a flow estimation loss term.

We modify the vid2vid architecture by playing around with the discriminator patch size. A problem we noticed in our initial trials that halfway through the Putin sanity check video (see below), his head would detach from his body when he moved his head to the side. This was because the discriminator patch size was too small, so it could not view the head and shoulders together and thus could not discriminate between whether the head was detached or not. Increasing the patch size during training solves this problem. Additionally, we try training on different numbers of frames of input video — specifically, we try 2000, 3000, and 5000 — as well as on datasets where we only transfer over the expression (not the pose).

Adversarial training is hard, and our training process was no exception. Even with the same parameters, different trials gave us noticeably different results. Thus, it was difficult to discern whether changes we made actually improved results or whether our training process had randomly sampled a better local minimum. Nevertheless, we found that variance in qualitative performance decreased as we increased dataset size and after further tuning we achieve fairly convincing results consistently.

# Results
## Conditioning Input Synthesis

Below is an example of our conditioning input synthesis of a video of Jaymo onto Putin. Here, we paste Jaymo’s expression parameters onto the parameters of Putin to generate a 3D morphable mesh. The result of rasterizing that mesh is our conditioning input into the GAN and is shown below.

[Rasterized frames of Jaymo](https://drive.google.com/a/berkeley.edu/file/d/1QNFR8wuuGzFimVpFCuQ9IRwkjB3VlyCE/view?usp=drivesdk)


**Camera Smoothing:**
Below is a comparison of the rasterized Putin mesh with and without the camera smoothing that we added. As you can see, the video without smoothing is much more bumpy and shaky than the video with smoothing.

[Without smoothing](https://drive.google.com/a/berkeley.edu/file/d/1g5iM29C0jzi95QTleeKc57g1bLUnjQzH/view?usp=drivesdk)

[With smoothing](https://drive.google.com/a/berkeley.edu/file/d/13HZ5SUmqHfCpttsgDdY4YBIxzis_Xqc7/view?usp=drivesdk)



## Head and Facial Reenactment

**Julia onto Putin:**
Below are two trials of transferring Julia’s face onto Putin’s face — one with both pose and expression transferred and one with only expression transferred. In the video with both pose and expression, there is noticeable deformation with Putin’s head in the last third of the video when Julia executes dramatic head motions and rotations. This is because our training dataset is the original Putin video and since he does not perform these drastic head motions in the original video, some of our test frames are essentially out of the training distribution. To reduce the effect of our test video being out of distribution, we try only transferring the expression parameters. As you can see, this results in Putin performing the head actions in his original video and mimicking only my expressions. As expected, this results in less deformation in our output video. Notice that there is still flickering present around the frames where Julia’s expression is out of distribution — for example, at the 4 s mark, Julia opens her mouth wide in a shocked expression, which causes flickering because Putin never opens his mouth wide in the original video. 

[Julia trial with pose + expression](https://drive.google.com/a/berkeley.edu/file/d/1DuE9Y7ux-hHUWh9oQtnV3BhL575w2nIp/view?usp=drivesdk)

[Julia trial with expression only](https://drive.google.com/a/berkeley.edu/file/d/1I9SFw0VgDpevrCQnWf2sgtGr0uIfxO1U/view?usp=drivesdk)

**Jaymo onto Putin:**
Because many of Julia’s expressions and poses are out of distribution, we do another trial on a video of Jaymo making expressions more within Putin’s expression distribution. The result of this trial is shown below, and as expected there is much less flickering. 

[Jaymo trial](https://drive.google.com/a/berkeley.edu/file/d/1eloBh_K36wkBTK819MqdYZYF478NEDZr/view?usp=drivesdk)

## Quantitative Evaluation

Below is an evaluation of the “error” of our generated results. As a sanity check, we perform an identity transform of Putin onto Putin, and check that the output of our program is similar to the original video. To quantify this check, we calculate the photometric alignment error between each frame of our synthesized output video and the original video, which is defined as the mean of the per-pixel distances. Formally:

$$E_{col}(C_s, C_i) = \frac{1}{|C_i|} \sum_{\mathbf{p} \in C_i} ||C_s(\mathbf{p}) - C_i(\mathbf{p})||_2$$

where $$C_s, C_i$$ are the synthesized and ground truth RGB images, respectively, and $$\mathbf{p} \in C_i$$ denotes all RGB pixels in $$C_i$$. For each frame, we display this error at the top and also generate a heat-map representing the photometric loss at each pixel. The result is shown below (brighter areas correspond to higher photometric loss). First, notice that our error is low for all the frames, hovering at a maximum of ~0.05. Also, notice that the error is highest for regions on Putin’s suit and tie, which makes sense because those areas are outside the reach of our conditioning input (remember that our conditioning input only contains a rasterized face).


[Side-by-side of the original Putin video and error video](https://drive.google.com/a/berkeley.edu/file/d/1Z1LlsKxo_HVk4qKDyMchdYHopxDZfFnI/view?usp=drivesdk)

[Per-pixel and total photometric error for each frame](https://drive.google.com/a/berkeley.edu/file/d/19Sq8dXccq_tOGnKhJ8HfYWXXYRfUFsvb/view?usp=drivesdk)

# References

[1] P. Paysan, R. Knothe, B. Amberg, S. Romdhani and T. Vetter, "A 3D Face Model for Pose and Illumination Invariant Face Recognition," *2009 Sixth IEEE International Conference on Advanced Video and Signal Based Surveillance*, Genova, 2009, pp. 296-301. doi: 10.1109/AVSS.2009.58

[2] Chen Cao, Yanlin Weng, Shun Zhou, Yiying Tong, and Kun Zhou. 2014. FaceWarehouse: A 3D Facial Expression Database for Visual Computing. *IEEE Transactions on Visualization and Computer Graphics* 20, 3 (March 2014), 413-425. DOI=http://dx.doi.org/10.1109/TVCG.2013.249

[3] Robert W. Sumner and Jovan Popović. 2004. Deformation transfer for triangle meshes. In *ACM SIGGRAPH 2004 Papers* (SIGGRAPH '04), Joe Marks (Ed.). ACM, New York, NY, USA, 399-405. DOI: https://doi.org/10.1145/1186562.1015736

[4] J. Booth et al., "3D Reconstruction of “In-the-Wild” Faces in Images and Videos," in IEEE Transactions on Pattern Analysis and Machine Intelligence, vol. 40, no. 11, pp. 2638-2652, 1 Nov. 2018. doi: 10.1109/TPAMI.2018.2832138

[5]  Tuan Tran, Anh, et al. ["Regressing robust and discriminative 3D morphable models with a very deep neural network."](https://arxiv.org/pdf/1612.04904v1.pdf) Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition. 2017.

[6] Wang, Ting-Chun, et al. "Video-to-video synthesis." [arXiv preprint arXiv:1808.06601](https://arxiv.org/abs/1808.06601) (2018).


# Contributions
- **Andrew Chan** - Constructed 3D morphable model of identity + expression from combination of Basel Face data [1] and FaceWarehouse expression blendshapes [2]. Wrote face reconstruction, input synthesis script. Wrote data-loader for vid2vid and trained single-image generator pix2pixHD. Generated conditioning input for various datasets and trained various models.
- **Julia Luo** - Extracted texture parameters from all datasets using CNN from [5] for monocular face reconstruction. Generated conditioning input for various datasets and trained various models. 
- **Jaymo Kang** - Implemented camera smoothing.

<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

